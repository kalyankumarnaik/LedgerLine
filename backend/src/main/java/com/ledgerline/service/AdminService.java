package com.ledgerline.service;

import com.ledgerline.domain.*;
import com.ledgerline.domain.enums.AdjustmentStatus;
import com.ledgerline.domain.enums.EntryType;
import com.ledgerline.domain.enums.TransactionStatus;
import com.ledgerline.domain.enums.TransactionType;
import com.ledgerline.dto.request.AdjustmentApprovalDto;
import com.ledgerline.dto.request.AdjustmentRequestDto;
import com.ledgerline.dto.response.AdjustmentResponseDto;
import com.ledgerline.dto.response.DashboardSummaryDto;
import com.ledgerline.dto.response.UserDto;
import com.ledgerline.exception.LedgerLineException;
import com.ledgerline.exception.ResourceNotFoundException;
import com.ledgerline.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final AccountBalanceRepository accountBalanceRepository;
    private final FinancialTransactionRepository transactionRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final AccountAdjustmentRequestRepository adjustmentRequestRepository;
    private final AdjustmentApprovalRepository adjustmentApprovalRepository;
    private final AuthService authService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public AdminService(UserRepository userRepository,
                        AccountRepository accountRepository,
                        AccountBalanceRepository accountBalanceRepository,
                        FinancialTransactionRepository transactionRepository,
                        JournalEntryRepository journalEntryRepository,
                        LedgerEntryRepository ledgerEntryRepository,
                        AccountAdjustmentRequestRepository adjustmentRequestRepository,
                        AdjustmentApprovalRepository adjustmentApprovalRepository,
                        AuthService authService,
                        AuditService auditService,
                        NotificationService notificationService) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.accountBalanceRepository = accountBalanceRepository;
        this.transactionRepository = transactionRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.adjustmentRequestRepository = adjustmentRequestRepository;
        this.adjustmentApprovalRepository = adjustmentApprovalRepository;
        this.authService = authService;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(authService::mapUserToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateUserStatus(UUID userId, boolean enabled, User adminUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setEnabled(enabled);
        user = userRepository.save(user);

        auditService.recordAuditEvent(adminUser, "UPDATE_USER_STATUS", "USER", userId.toString(),
                "Set user enabled=" + enabled, null);

        return authService.mapUserToDto(user);
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getSystemDashboardSummary() {
        DashboardSummaryDto summary = new DashboardSummaryDto();

        List<AccountBalance> balances = accountBalanceRepository.findAll();
        BigDecimal totalBalance = balances.stream()
                .map(AccountBalance::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalBalance(totalBalance);

        List<FinancialTransaction> allTxns = transactionRepository.findAllByOrderByCreatedAtDesc();
        summary.setTotalTransfers(allTxns.size());

        BigDecimal totalIncoming = BigDecimal.ZERO;
        BigDecimal totalOutgoing = BigDecimal.ZERO;

        for (FinancialTransaction tx : allTxns) {
            if (tx.getStatus() == TransactionStatus.POSTED) {
                if (tx.getTransactionType() == TransactionType.DEPOSIT) {
                    totalIncoming = totalIncoming.add(tx.getAmount());
                } else if (tx.getTransactionType() == TransactionType.WITHDRAWAL) {
                    totalOutgoing = totalOutgoing.add(tx.getAmount());
                }
            }
        }

        summary.setTotalIncoming(totalIncoming);
        summary.setTotalOutgoing(totalOutgoing);
        summary.setPendingTransfers(transactionRepository.countByStatus(TransactionStatus.PENDING));
        summary.setFailedTransfers(transactionRepository.countByStatus(TransactionStatus.FAILED));

        return summary;
    }

    // =========================================================================
    // AUTHORIZED ADJUSTMENT WORKFLOW (Two-Step Admin Approval with Compensating Double-Entry)
    // =========================================================================
    @Transactional
    public AdjustmentResponseDto requestAdjustment(AdjustmentRequestDto request, User adminRequester) {
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + request.getAccountId()));

        AccountAdjustmentRequest adjRequest = new AccountAdjustmentRequest(
                account,
                request.getAdjustmentType().toUpperCase(),
                request.getAmount(),
                request.getReason(),
                adminRequester
        );
        adjRequest = adjustmentRequestRepository.save(adjRequest);

        auditService.recordAuditEvent(adminRequester, "ADJUSTMENT_REQUESTED", "ADJUSTMENT", adjRequest.getId().toString(),
                "Requested " + request.getAdjustmentType() + " adjustment of ₹" + request.getAmount() + " on " + account.getAccountNumber(), null);

        return mapAdjustmentToDto(adjRequest);
    }

    @Transactional
    public AdjustmentResponseDto reviewAdjustment(UUID requestId, AdjustmentApprovalDto approvalDto, User approverAdmin) {
        AccountAdjustmentRequest request = adjustmentRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjustment request not found: " + requestId));

        if (request.getStatus() != AdjustmentStatus.PENDING) {
            throw new LedgerLineException("Adjustment request has already been resolved: " + request.getStatus());
        }

        AdjustmentApproval approval = new AdjustmentApproval(
                request,
                approverAdmin,
                approvalDto.getDecision().toUpperCase(),
                approvalDto.getComments()
        );
        adjustmentApprovalRepository.save(approval);

        if ("APPROVED".equalsIgnoreCase(approvalDto.getDecision())) {
            request.setStatus(AdjustmentStatus.APPROVED);
            request.setApprovedBy(approverAdmin);
            request.setResolvedAt(Instant.now());

            // Post Compensating Double-Entry Transaction to satisfy accounting invariance!
            executeAdjustmentPostings(request, approverAdmin);
        } else {
            request.setStatus(AdjustmentStatus.REJECTED);
            request.setApprovedBy(approverAdmin);
            request.setResolvedAt(Instant.now());
        }

        adjustmentRequestRepository.save(request);

        auditService.recordAuditEvent(approverAdmin, "ADJUSTMENT_REVIEWED", "ADJUSTMENT", request.getId().toString(),
                "Decision: " + approvalDto.getDecision() + ", Comments: " + approvalDto.getComments(), null);

        return mapAdjustmentToDto(request);
    }

    private void executeAdjustmentPostings(AccountAdjustmentRequest request, User approver) {
        Account account = request.getAccount();
        AccountBalance balance = accountBalanceRepository.findByAccountIdWithLock(account.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Balance not found"));

        Account clearingAccount = accountRepository.findSystemClearingAccount()
                .orElseThrow(() -> new ResourceNotFoundException("Clearing account not found"));
        AccountBalance clearingBalance = accountBalanceRepository.findByAccountIdWithLock(clearingAccount.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Clearing balance not found"));

        BigDecimal amount = request.getAmount();

        BigDecimal newAccountBalance;
        BigDecimal newClearingBalance;

        boolean isCredit = "CREDIT".equalsIgnoreCase(request.getAdjustmentType());

        if (isCredit) {
            newAccountBalance = balance.getBalance().add(amount);
            newClearingBalance = clearingBalance.getBalance().subtract(amount);
        } else {
            if (balance.getBalance().compareTo(amount) < 0) {
                throw new LedgerLineException("Cannot debit account below zero for adjustment");
            }
            newAccountBalance = balance.getBalance().subtract(amount);
            newClearingBalance = clearingBalance.getBalance().add(amount);
        }

        balance.setBalance(newAccountBalance);
        clearingBalance.setBalance(newClearingBalance);
        accountBalanceRepository.save(balance);
        accountBalanceRepository.save(clearingBalance);

        String ref = "TXN-ADJ-" + System.currentTimeMillis();
        FinancialTransaction tx = new FinancialTransaction(
                ref,
                TransactionType.ADJUSTMENT,
                isCredit ? clearingAccount : account,
                isCredit ? account : clearingAccount,
                amount,
                account.getCurrency(),
                TransactionStatus.POSTED,
                "Authorized Adjustment: " + request.getReason(),
                approver
        );
        tx.setCompletedAt(Instant.now());
        transactionRepository.save(tx);

        JournalEntry jrn = new JournalEntry(tx, "JRN-ADJ-" + System.currentTimeMillis(), tx.getDescription());
        journalEntryRepository.save(jrn);

        LedgerEntry entry1 = new LedgerEntry(jrn, isCredit ? clearingAccount : account, EntryType.DEBIT, amount, isCredit ? newClearingBalance : newAccountBalance);
        LedgerEntry entry2 = new LedgerEntry(jrn, isCredit ? account : clearingAccount, EntryType.CREDIT, amount, isCredit ? newAccountBalance : newClearingBalance);

        ledgerEntryRepository.save(entry1);
        ledgerEntryRepository.save(entry2);
    }

    @Transactional(readOnly = true)
    public List<AdjustmentResponseDto> getAllAdjustmentRequests() {
        return adjustmentRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapAdjustmentToDto)
                .collect(Collectors.toList());
    }

    private AdjustmentResponseDto mapAdjustmentToDto(AccountAdjustmentRequest req) {
        AdjustmentResponseDto dto = new AdjustmentResponseDto();
        dto.setId(req.getId());
        dto.setAccountId(req.getAccount().getId());
        dto.setAccountNumber(req.getAccount().getAccountNumber());
        dto.setAdjustmentType(req.getAdjustmentType());
        dto.setAmount(req.getAmount());
        dto.setReason(req.getReason());
        dto.setStatus(req.getStatus());
        dto.setRequestedByUsername(req.getRequestedBy() != null ? req.getRequestedBy().getUsername() : null);
        dto.setApprovedByUsername(req.getApprovedBy() != null ? req.getApprovedBy().getUsername() : null);
        dto.setCreatedAt(req.getCreatedAt());
        dto.setResolvedAt(req.getResolvedAt());
        return dto;
    }
}
