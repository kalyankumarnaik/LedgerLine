package com.ledgerline.service;

import com.ledgerline.domain.*;
import com.ledgerline.domain.enums.*;
import com.ledgerline.dto.request.DepositRequest;
import com.ledgerline.dto.request.TransferRequest;
import com.ledgerline.dto.request.WithdrawRequest;
import com.ledgerline.dto.response.TransactionDto;
import com.ledgerline.exception.*;
import com.ledgerline.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
public class FinancialEngineService {

    private static final Logger log = LoggerFactory.getLogger(FinancialEngineService.class);

    private final AccountRepository accountRepository;
    private final AccountBalanceRepository accountBalanceRepository;
    private final AccountPermissionRepository accountPermissionRepository;
    private final TransactionLimitRepository transactionLimitRepository;
    private final FinancialTransactionRepository transactionRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final IdempotencyService idempotencyService;
    private final AuditService auditService;
    private final RiskReviewEngine riskReviewEngine;
    private final NotificationService notificationService;

    @Value("${ledgerline.system.clearing-account-id:00000000-0000-0000-0000-000000000001}")
    private String clearingAccountIdStr;

    public FinancialEngineService(AccountRepository accountRepository,
                                  AccountBalanceRepository accountBalanceRepository,
                                  AccountPermissionRepository accountPermissionRepository,
                                  TransactionLimitRepository transactionLimitRepository,
                                  FinancialTransactionRepository transactionRepository,
                                  JournalEntryRepository journalEntryRepository,
                                  LedgerEntryRepository ledgerEntryRepository,
                                  IdempotencyService idempotencyService,
                                  AuditService auditService,
                                  RiskReviewEngine riskReviewEngine,
                                  NotificationService notificationService) {
        this.accountRepository = accountRepository;
        this.accountBalanceRepository = accountBalanceRepository;
        this.accountPermissionRepository = accountPermissionRepository;
        this.transactionLimitRepository = transactionLimitRepository;
        this.transactionRepository = transactionRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.idempotencyService = idempotencyService;
        this.auditService = auditService;
        this.riskReviewEngine = riskReviewEngine;
        this.notificationService = notificationService;
    }

    private Account getClearingAccount() {
        UUID clearingId = UUID.fromString(clearingAccountIdStr);
        return accountRepository.findById(clearingId)
                .orElseGet(() -> accountRepository.findSystemClearingAccount()
                        .orElseThrow(() -> new ResourceNotFoundException("System clearing account not configured.")));
    }

    // =========================================================================
    // 1. INTERNAL TRANSFER (Atomic, Pessimistic Row Locking, Ordered Lock Acquisition)
    // =========================================================================
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionDto executeTransfer(TransferRequest request, User initiatingUser) {
        String correlationId = UUID.randomUUID().toString();
        String idempotencyKey = request.getIdempotencyKey();

        // 1. Idempotency Check
        Optional<TransactionDto> cached = idempotencyService.checkAndLockKey(
                idempotencyKey, initiatingUser, "TRANSFER", request, TransactionDto.class);
        if (cached.isPresent()) {
            return cached.get();
        }

        UUID sourceId = request.getSourceAccountId();
        BigDecimal amount = request.getAmount().setScale(4, RoundingMode.HALF_EVEN);

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            recordFailureAndThrow(correlationId, initiatingUser, sourceId, "TRANSFER", amount, idempotencyKey,
                    "Transfer amount must be strictly greater than zero",
                    new LedgerLineException("Transfer amount must be strictly greater than zero"));
        }

        try {
            // Find destination account by account number
            Account destAccount = accountRepository.findByAccountNumber(request.getDestinationAccountNumber())
                    .orElseThrow(() -> new ResourceNotFoundException("Destination account not found: " + request.getDestinationAccountNumber()));
            UUID destId = destAccount.getId();

            if (sourceId.equals(destId)) {
                throw new LedgerLineException("Source and destination accounts must be different.");
            }

            // Verify account ownership/permission
            verifyAccountAccess(sourceId, initiatingUser.getId(), PermissionType.OWNER);

            // 2. Deterministic Row-Level Lock Acquisition (prevents deadlocks for A->B & B->A)
            AccountBalance sourceBalance;
            AccountBalance destBalance;

            if (sourceId.compareTo(destId) < 0) {
                sourceBalance = accountBalanceRepository.findByAccountIdWithLock(sourceId)
                        .orElseThrow(() -> new ResourceNotFoundException("Source balance record not found."));
                destBalance = accountBalanceRepository.findByAccountIdWithLock(destId)
                        .orElseThrow(() -> new ResourceNotFoundException("Destination balance record not found."));
            } else {
                destBalance = accountBalanceRepository.findByAccountIdWithLock(destId)
                        .orElseThrow(() -> new ResourceNotFoundException("Destination balance record not found."));
                sourceBalance = accountBalanceRepository.findByAccountIdWithLock(sourceId)
                        .orElseThrow(() -> new ResourceNotFoundException("Source balance record not found."));
            }

            Account sourceAccount = sourceBalance.getAccount();
            destAccount = destBalance.getAccount();

            // 3. Status checks
            if (sourceAccount.getStatus() != AccountStatus.ACTIVE) {
                throw new AccountInactiveException("Source account is " + sourceAccount.getStatus() + ". Transfers are not permitted.");
            }
            if (destAccount.getStatus() != AccountStatus.ACTIVE) {
                throw new AccountInactiveException("Destination account is " + destAccount.getStatus() + ". Transfers are not permitted.");
            }

            // 4. Enforce Transaction Limits
            enforceLimits(sourceId, amount);

            // 5. Balance Validation (No Overdraft, Non-negative guarantee)
            if (sourceBalance.getBalance().compareTo(amount) < 0) {
                throw new InsufficientFundsException("Insufficient funds. Available: ₹" + sourceBalance.getBalance() + ", Requested: ₹" + amount);
            }

            // 6. Update Materialized Balances
            BigDecimal newSourceBalance = sourceBalance.getBalance().subtract(amount);
            BigDecimal newDestBalance = destBalance.getBalance().add(amount);

            sourceBalance.setBalance(newSourceBalance);
            destBalance.setBalance(newDestBalance);

            accountBalanceRepository.save(sourceBalance);
            accountBalanceRepository.save(destBalance);

            // 7. Record Financial Transaction
            String txRef = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            FinancialTransaction tx = new FinancialTransaction(
                    txRef,
                    TransactionType.TRANSFER,
                    sourceAccount,
                    destAccount,
                    amount,
                    sourceAccount.getCurrency(),
                    TransactionStatus.POSTED,
                    request.getDescription() != null ? request.getDescription() : "Account transfer to " + destAccount.getAccountNumber(),
                    initiatingUser
            );
            tx.setCompletedAt(Instant.now());
            transactionRepository.save(tx);

            // 8. Create Double-Entry Journal Entry
            String jrnRef = "JRN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            JournalEntry journalEntry = new JournalEntry(tx, jrnRef, tx.getDescription());
            journalEntryRepository.save(journalEntry);

            // 9. Create Balanced Ledger Postings
            LedgerEntry debitEntry = new LedgerEntry(journalEntry, sourceAccount, EntryType.DEBIT, amount, newSourceBalance);
            LedgerEntry creditEntry = new LedgerEntry(journalEntry, destAccount, EntryType.CREDIT, amount, newDestBalance);

            // Accounting Invariant Assertion: debit == credit
            if (debitEntry.getAmount().compareTo(creditEntry.getAmount()) != 0) {
                throw new AccountingInvariantViolationException("Accounting invariant broken: Debit (" + debitEntry.getAmount() + ") != Credit (" + creditEntry.getAmount() + ")");
            }

            ledgerEntryRepository.save(debitEntry);
            ledgerEntryRepository.save(creditEntry);

            // 10. Audit, Notifications & Risk Review
            auditService.recordAuditEvent(initiatingUser, "TRANSFER", "TRANSACTION", txRef,
                    "Transferred ₹" + amount + " from " + sourceAccount.getAccountNumber() + " to " + destAccount.getAccountNumber(), null);

            notificationService.createNotification(initiatingUser, "Transfer Completed",
                    "Sent ₹" + amount + " to " + destAccount.getAccountNumber() + " (Ref: " + txRef + ")", NotificationType.SUCCESS);

            if (destAccount.getUser() != null && !destAccount.getUser().getId().equals(initiatingUser.getId())) {
                notificationService.createNotification(destAccount.getUser(), "Transfer Received",
                        "Received ₹" + amount + " from " + sourceAccount.getAccountNumber() + " (Ref: " + txRef + ")", NotificationType.SUCCESS);
            }

            riskReviewEngine.evaluateTransaction(tx);

            TransactionDto dto = mapToDto(tx);
            idempotencyService.recordSuccess(idempotencyKey, initiatingUser, dto);
            return dto;

        } catch (Exception ex) {
            recordFailureAndThrow(correlationId, initiatingUser, sourceId, "TRANSFER", amount, idempotencyKey, ex.getMessage(), ex);
            return null; // unreachable
        }
    }

    // =========================================================================
    // 2. EXTERNAL DEPOSIT (Balanced against System Clearing Account)
    // =========================================================================
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionDto executeDeposit(DepositRequest request, User initiatingUser) {
        String correlationId = UUID.randomUUID().toString();
        String idempotencyKey = request.getIdempotencyKey();

        Optional<TransactionDto> cached = idempotencyService.checkAndLockKey(
                idempotencyKey, initiatingUser, "DEPOSIT", request, TransactionDto.class);
        if (cached.isPresent()) return cached.get();

        UUID accountId = request.getAccountId();
        BigDecimal amount = request.getAmount().setScale(4, RoundingMode.HALF_EVEN);

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            recordFailureAndThrow(correlationId, initiatingUser, accountId, "DEPOSIT", amount, idempotencyKey,
                    "Deposit amount must be strictly greater than zero",
                    new LedgerLineException("Deposit amount must be strictly greater than zero"));
        }

        try {
            verifyAccountAccess(accountId, initiatingUser.getId(), PermissionType.OWNER);

            Account clearingAccount = getClearingAccount();
            AccountBalance clearingBalance = accountBalanceRepository.findByAccountIdWithLock(clearingAccount.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Clearing account balance record not found."));

            AccountBalance targetBalance = accountBalanceRepository.findByAccountIdWithLock(accountId)
                    .orElseThrow(() -> new ResourceNotFoundException("Target account balance record not found."));

            Account targetAccount = targetBalance.getAccount();
            if (targetAccount.getStatus() != AccountStatus.ACTIVE) {
                throw new AccountInactiveException("Account is " + targetAccount.getStatus() + ". Deposits are not permitted.");
            }

            // Materialized balance updates
            BigDecimal newClearingBalance = clearingBalance.getBalance().subtract(amount);
            BigDecimal newTargetBalance = targetBalance.getBalance().add(amount);

            clearingBalance.setBalance(newClearingBalance);
            targetBalance.setBalance(newTargetBalance);

            accountBalanceRepository.save(clearingBalance);
            accountBalanceRepository.save(targetBalance);

            // Record Financial Transaction
            String txRef = "TXN-DEP-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            FinancialTransaction tx = new FinancialTransaction(
                    txRef,
                    TransactionType.DEPOSIT,
                    clearingAccount,
                    targetAccount,
                    amount,
                    targetAccount.getCurrency(),
                    TransactionStatus.POSTED,
                    request.getDescription() != null ? request.getDescription() : "External funding deposit",
                    initiatingUser
            );
            tx.setCompletedAt(Instant.now());
            transactionRepository.save(tx);

            // Journal Entry
            String jrnRef = "JRN-DEP-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            JournalEntry journalEntry = new JournalEntry(tx, jrnRef, tx.getDescription());
            journalEntryRepository.save(journalEntry);

            // Balanced Ledger Postings: Debit Clearing Reserve, Credit Customer Account
            LedgerEntry debitEntry = new LedgerEntry(journalEntry, clearingAccount, EntryType.DEBIT, amount, newClearingBalance);
            LedgerEntry creditEntry = new LedgerEntry(journalEntry, targetAccount, EntryType.CREDIT, amount, newTargetBalance);

            ledgerEntryRepository.save(debitEntry);
            ledgerEntryRepository.save(creditEntry);

            auditService.recordAuditEvent(initiatingUser, "DEPOSIT", "ACCOUNT", targetAccount.getAccountNumber(),
                    "Deposited ₹" + amount + " into " + targetAccount.getAccountNumber(), null);

            notificationService.createNotification(initiatingUser, "Deposit Successful",
                    "Credited ₹" + amount + " to account " + targetAccount.getAccountNumber(), NotificationType.SUCCESS);

            riskReviewEngine.evaluateTransaction(tx);

            TransactionDto dto = mapToDto(tx);
            idempotencyService.recordSuccess(idempotencyKey, initiatingUser, dto);
            return dto;

        } catch (Exception ex) {
            recordFailureAndThrow(correlationId, initiatingUser, accountId, "DEPOSIT", amount, idempotencyKey, ex.getMessage(), ex);
            return null;
        }
    }

    // =========================================================================
    // 3. WITHDRAWAL (Balanced against System Clearing Account)
    // =========================================================================
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionDto executeWithdraw(WithdrawRequest request, User initiatingUser) {
        String correlationId = UUID.randomUUID().toString();
        String idempotencyKey = request.getIdempotencyKey();

        Optional<TransactionDto> cached = idempotencyService.checkAndLockKey(
                idempotencyKey, initiatingUser, "WITHDRAWAL", request, TransactionDto.class);
        if (cached.isPresent()) return cached.get();

        UUID accountId = request.getAccountId();
        BigDecimal amount = request.getAmount().setScale(4, RoundingMode.HALF_EVEN);

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            recordFailureAndThrow(correlationId, initiatingUser, accountId, "WITHDRAWAL", amount, idempotencyKey,
                    "Withdrawal amount must be strictly greater than zero",
                    new LedgerLineException("Withdrawal amount must be strictly greater than zero"));
        }

        try {
            verifyAccountAccess(accountId, initiatingUser.getId(), PermissionType.OWNER);

            Account clearingAccount = getClearingAccount();
            AccountBalance targetBalance = accountBalanceRepository.findByAccountIdWithLock(accountId)
                    .orElseThrow(() -> new ResourceNotFoundException("Account balance record not found."));

            AccountBalance clearingBalance = accountBalanceRepository.findByAccountIdWithLock(clearingAccount.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Clearing balance record not found."));

            Account targetAccount = targetBalance.getAccount();
            if (targetAccount.getStatus() != AccountStatus.ACTIVE) {
                throw new AccountInactiveException("Account is " + targetAccount.getStatus() + ". Withdrawals are not permitted.");
            }

            enforceLimits(accountId, amount);

            if (targetBalance.getBalance().compareTo(amount) < 0) {
                throw new InsufficientFundsException("Insufficient funds for withdrawal. Available: ₹" + targetBalance.getBalance() + ", Requested: ₹" + amount);
            }

            BigDecimal newTargetBalance = targetBalance.getBalance().subtract(amount);
            BigDecimal newClearingBalance = clearingBalance.getBalance().add(amount);

            targetBalance.setBalance(newTargetBalance);
            clearingBalance.setBalance(newClearingBalance);

            accountBalanceRepository.save(targetBalance);
            accountBalanceRepository.save(clearingBalance);

            String txRef = "TXN-WDL-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            FinancialTransaction tx = new FinancialTransaction(
                    txRef,
                    TransactionType.WITHDRAWAL,
                    targetAccount,
                    clearingAccount,
                    amount,
                    targetAccount.getCurrency(),
                    TransactionStatus.POSTED,
                    request.getDescription() != null ? request.getDescription() : "External withdrawal disbursement",
                    initiatingUser
            );
            tx.setCompletedAt(Instant.now());
            transactionRepository.save(tx);

            String jrnRef = "JRN-WDL-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            JournalEntry journalEntry = new JournalEntry(tx, jrnRef, tx.getDescription());
            journalEntryRepository.save(journalEntry);

            // Balanced: Debit Customer Account, Credit Clearing Reserve
            LedgerEntry debitEntry = new LedgerEntry(journalEntry, targetAccount, EntryType.DEBIT, amount, newTargetBalance);
            LedgerEntry creditEntry = new LedgerEntry(journalEntry, clearingAccount, EntryType.CREDIT, amount, newClearingBalance);

            ledgerEntryRepository.save(debitEntry);
            ledgerEntryRepository.save(creditEntry);

            auditService.recordAuditEvent(initiatingUser, "WITHDRAWAL", "ACCOUNT", targetAccount.getAccountNumber(),
                    "Withdrew ₹" + amount + " from " + targetAccount.getAccountNumber(), null);

            notificationService.createNotification(initiatingUser, "Withdrawal Processed",
                    "Debited ₹" + amount + " from account " + targetAccount.getAccountNumber(), NotificationType.SUCCESS);

            riskReviewEngine.evaluateTransaction(tx);

            TransactionDto dto = mapToDto(tx);
            idempotencyService.recordSuccess(idempotencyKey, initiatingUser, dto);
            return dto;

        } catch (Exception ex) {
            recordFailureAndThrow(correlationId, initiatingUser, accountId, "WITHDRAWAL", amount, idempotencyKey, ex.getMessage(), ex);
            return null;
        }
    }

    // =========================================================================
    // HELPER METHODS: Permissions, Limits, Auditing, Mapping
    // =========================================================================
    public void verifyAccountAccess(UUID accountId, UUID userId, PermissionType requiredPerm) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));

        if (account.getUser().getId().equals(userId)) {
            return; // Owner has full access
        }

        boolean hasPerm = accountPermissionRepository.existsByAccountIdAndUserId(accountId, userId);
        if (!hasPerm) {
            throw new UnauthorizedAccountAccessException("You are not authorized to perform operations on account " + account.getAccountNumber());
        }
    }

    private void enforceLimits(UUID accountId, BigDecimal amount) {
        Optional<TransactionLimit> limitOpt = transactionLimitRepository.findByAccountId(accountId);
        if (limitOpt.isPresent()) {
            TransactionLimit limit = limitOpt.get();
            if (amount.compareTo(limit.getPerTransactionLimit()) > 0) {
                throw new TransactionLimitExceededException("Amount ₹" + amount + " exceeds per-transaction limit ₹" + limit.getPerTransactionLimit());
            }

            Instant startOfDay = Instant.now().truncatedTo(ChronoUnit.DAYS);
            BigDecimal dailySpent = transactionRepository.sumOutgoingAmountSince(accountId, startOfDay);
            if (dailySpent.add(amount).compareTo(limit.getDailyLimit()) > 0) {
                throw new TransactionLimitExceededException("Amount ₹" + amount + " exceeds remaining daily limit. Spent today: ₹" + dailySpent + ", Daily Limit: ₹" + limit.getDailyLimit());
            }
        }
    }

    private void recordFailureAndThrow(String correlationId, User user, UUID accountId,
                                       String operation, BigDecimal amount, String idempotencyKey,
                                       String reason, Exception originalException) {
        auditService.recordFailedAttempt(correlationId, user, accountId, operation, amount, idempotencyKey, reason);
        idempotencyService.recordFailure(idempotencyKey, user, reason);
        if (user != null) {
            riskReviewEngine.evaluateRepeatedFailures(user.getId(), accountId);
            notificationService.createNotification(user, "Transaction Failed",
                    "Failed to process " + operation + ": " + reason + " (Ref: " + correlationId + ")", NotificationType.ERROR);
        }

        if (originalException instanceof RuntimeException) {
            throw (RuntimeException) originalException;
        } else {
            throw new LedgerLineException(reason, originalException);
        }
    }

    public TransactionDto mapToDto(FinancialTransaction tx) {
        TransactionDto dto = new TransactionDto();
        dto.setId(tx.getId());
        dto.setTransactionReference(tx.getTransactionReference());
        dto.setTransactionType(tx.getTransactionType());
        if (tx.getSourceAccount() != null) {
            dto.setSourceAccountId(tx.getSourceAccount().getId());
            dto.setSourceAccountNumber(tx.getSourceAccount().getAccountNumber());
        }
        if (tx.getDestinationAccount() != null) {
            dto.setDestinationAccountId(tx.getDestinationAccount().getId());
            dto.setDestinationAccountNumber(tx.getDestinationAccount().getAccountNumber());
        }
        dto.setAmount(tx.getAmount());
        dto.setCurrency(tx.getCurrency());
        dto.setStatus(tx.getStatus());
        dto.setDescription(tx.getDescription());
        dto.setInitiatedByUsername(tx.getInitiatedBy() != null ? tx.getInitiatedBy().getUsername() : "SYSTEM");
        dto.setFailureReason(tx.getFailureReason());
        dto.setCreatedAt(tx.getCreatedAt());
        dto.setCompletedAt(tx.getCompletedAt());
        return dto;
    }
}
