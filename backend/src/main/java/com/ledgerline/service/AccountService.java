package com.ledgerline.service;

import com.ledgerline.domain.*;
import com.ledgerline.domain.enums.AccountStatus;
import com.ledgerline.domain.enums.PermissionType;
import com.ledgerline.dto.request.CreateAccountRequest;
import com.ledgerline.dto.request.UpdateTransactionLimitRequest;
import com.ledgerline.dto.response.AccountDto;
import com.ledgerline.exception.LedgerLineException;
import com.ledgerline.exception.ResourceNotFoundException;
import com.ledgerline.exception.UnauthorizedAccountAccessException;
import com.ledgerline.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final AccountBalanceRepository accountBalanceRepository;
    private final AccountPermissionRepository accountPermissionRepository;
    private final TransactionLimitRepository transactionLimitRepository;
    private final AuditService auditService;

    public AccountService(AccountRepository accountRepository,
                          AccountBalanceRepository accountBalanceRepository,
                          AccountPermissionRepository accountPermissionRepository,
                          TransactionLimitRepository transactionLimitRepository,
                          AuditService auditService) {
        this.accountRepository = accountRepository;
        this.accountBalanceRepository = accountBalanceRepository;
        this.accountPermissionRepository = accountPermissionRepository;
        this.transactionLimitRepository = transactionLimitRepository;
        this.auditService = auditService;
    }

    @Transactional
    public AccountDto createAccount(CreateAccountRequest request, User user) {
        String prefix = switch (request.getAccountType()) {
            case CHECKING -> "LL-CHK-";
            case SAVINGS -> "LL-SAV-";
            case ESCROW -> "LL-ESC-";
            case SYSTEM_CLEARING -> "SYS-CLR-";
        };

        String accountNumber = prefix + (10000000 + (long)(Math.random() * 90000000));
        Account account = new Account(accountNumber, user, request.getName(), request.getAccountType(), request.getCurrency());
        account = accountRepository.save(account);

        AccountBalance balance = new AccountBalance(account, BigDecimal.ZERO);
        accountBalanceRepository.save(balance);

        AccountPermission permission = new AccountPermission(account, user, PermissionType.OWNER);
        accountPermissionRepository.save(permission);

        TransactionLimit limit = new TransactionLimit(account, new BigDecimal("100000.0000"), new BigDecimal("50000.0000"));
        transactionLimitRepository.save(limit);

        auditService.recordAuditEvent(user, "ACCOUNT_CREATE", "ACCOUNT", account.getAccountNumber(),
                "Created account " + accountNumber + " (" + request.getAccountType() + ")", null);

        return mapToDto(account, balance, limit);
    }

    @Transactional(readOnly = true)
    public List<AccountDto> getUserAccounts(UUID userId) {
        return accountRepository.findAllByUserId(userId).stream()
                .map(this::mapAccountToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AccountDto> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(this::mapAccountToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountDto getAccountById(UUID accountId, User user, boolean isAdminOrAuditor) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));

        if (!isAdminOrAuditor && !account.getUser().getId().equals(user.getId())) {
            boolean hasPermission = accountPermissionRepository.existsByAccountIdAndUserId(accountId, user.getId());
            if (!hasPermission) {
                throw new UnauthorizedAccountAccessException("You are not authorized to view this account.");
            }
        }

        return mapAccountToDto(account);
    }

    @Transactional
    public AccountDto updateAccountStatus(UUID accountId, AccountStatus newStatus, User adminUser) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));

        AccountStatus oldStatus = account.getStatus();
        account.setStatus(newStatus);
        accountRepository.save(account);

        auditService.recordAuditEvent(adminUser, "ACCOUNT_STATUS_CHANGE", "ACCOUNT", account.getAccountNumber(),
                "Changed status of " + account.getAccountNumber() + " from " + oldStatus + " to " + newStatus, null);

        return mapAccountToDto(account);
    }

    @Transactional
    public void updateTransactionLimit(UUID accountId, UpdateTransactionLimitRequest request, User adminOrOwner) {
        TransactionLimit limit = transactionLimitRepository.findByAccountId(accountId)
                .orElseGet(() -> {
                    Account acc = accountRepository.findById(accountId)
                            .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));
                    return new TransactionLimit(acc, request.getDailyLimit(), request.getPerTransactionLimit());
                });

        limit.setDailyLimit(request.getDailyLimit());
        limit.setPerTransactionLimit(request.getPerTransactionLimit());
        transactionLimitRepository.save(limit);

        auditService.recordAuditEvent(adminOrOwner, "UPDATE_LIMITS", "ACCOUNT", accountId.toString(),
                "Updated limits: daily=" + request.getDailyLimit() + ", perTxn=" + request.getPerTransactionLimit(), null);
    }

    public AccountDto mapAccountToDto(Account account) {
        AccountBalance balance = accountBalanceRepository.findByAccountId(account.getId())
                .orElse(new AccountBalance(account, BigDecimal.ZERO));
        TransactionLimit limit = transactionLimitRepository.findByAccountId(account.getId())
                .orElse(new TransactionLimit(account, new BigDecimal("100000.0000"), new BigDecimal("50000.0000")));

        return mapToDto(account, balance, limit);
    }

    private AccountDto mapToDto(Account account, AccountBalance balance, TransactionLimit limit) {
        return new AccountDto(
                account.getId(),
                account.getAccountNumber(),
                account.getUser() != null ? account.getUser().getId() : null,
                account.getUser() != null ? account.getUser().getFullName() : "SYSTEM",
                account.getName(),
                account.getAccountType(),
                account.getStatus(),
                account.getCurrency(),
                balance.getBalance(),
                limit != null ? limit.getDailyLimit() : null,
                limit != null ? limit.getPerTransactionLimit() : null,
                account.getCreatedAt()
        );
    }
}
