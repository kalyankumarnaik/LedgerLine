package com.ledgerline.service;

import com.ledgerline.domain.Account;
import com.ledgerline.domain.AccountBalance;
import com.ledgerline.domain.LedgerEntry;
import com.ledgerline.domain.User;
import com.ledgerline.domain.enums.EntryType;
import com.ledgerline.dto.response.LedgerEntryDto;
import com.ledgerline.dto.response.StatementDto;
import com.ledgerline.exception.ResourceNotFoundException;
import com.ledgerline.repository.AccountBalanceRepository;
import com.ledgerline.repository.AccountRepository;
import com.ledgerline.repository.LedgerEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StatementService {

    private final AccountRepository accountRepository;
    private final AccountBalanceRepository accountBalanceRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final FinancialEngineService financialEngineService;

    public StatementService(AccountRepository accountRepository,
                            AccountBalanceRepository accountBalanceRepository,
                            LedgerEntryRepository ledgerEntryRepository,
                            FinancialEngineService financialEngineService) {
        this.accountRepository = accountRepository;
        this.accountBalanceRepository = accountBalanceRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.financialEngineService = financialEngineService;
    }

    @Transactional(readOnly = true)
    public StatementDto generateStatement(UUID accountId, Instant fromDate, Instant toDate, User user, boolean isAdminOrAuditor) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));

        if (!isAdminOrAuditor) {
            financialEngineService.verifyAccountAccess(accountId, user.getId(), null);
        }

        List<LedgerEntry> allEntries = ledgerEntryRepository.findAllByAccountIdOrderByCreatedAtAsc(accountId);

        BigDecimal openingBalance = BigDecimal.ZERO;
        BigDecimal totalDebits = BigDecimal.ZERO;
        BigDecimal totalCredits = BigDecimal.ZERO;
        List<LedgerEntryDto> statementEntries = new ArrayList<>();

        for (LedgerEntry entry : allEntries) {
            Instant entryTime = entry.getCreatedAt();

            if (fromDate != null && entryTime.isBefore(fromDate)) {
                // Accumulate to opening balance
                if (entry.getEntryType() == EntryType.CREDIT) {
                    openingBalance = openingBalance.add(entry.getAmount());
                } else {
                    openingBalance = openingBalance.subtract(entry.getAmount());
                }
            } else if (toDate == null || !entryTime.isAfter(toDate)) {
                // In-period entry
                if (entry.getEntryType() == EntryType.CREDIT) {
                    totalCredits = totalCredits.add(entry.getAmount());
                } else {
                    totalDebits = totalDebits.add(entry.getAmount());
                }

                statementEntries.add(new LedgerEntryDto(
                        entry.getId(),
                        account.getId(),
                        account.getAccountNumber(),
                        entry.getEntryType(),
                        entry.getAmount(),
                        entry.getRunningBalance(),
                        entry.getCreatedAt()
                ));
            }
        }

        AccountBalance balance = accountBalanceRepository.findByAccountId(accountId)
                .orElse(new AccountBalance(account, BigDecimal.ZERO));

        BigDecimal closingBalance = openingBalance.add(totalCredits).subtract(totalDebits);

        StatementDto statement = new StatementDto();
        statement.setAccountId(account.getId());
        statement.setAccountNumber(account.getAccountNumber());
        statement.setAccountName(account.getName());
        statement.setCurrency(account.getCurrency());
        statement.setPeriodStart(fromDate);
        statement.setPeriodEnd(toDate != null ? toDate : Instant.now());
        statement.setOpeningBalance(openingBalance);
        statement.setClosingBalance(closingBalance);
        statement.setTotalDebits(totalDebits);
        statement.setTotalCredits(totalCredits);
        statement.setEntries(statementEntries);

        return statement;
    }

    @Transactional(readOnly = true)
    public String exportStatementCsv(UUID accountId, Instant fromDate, Instant toDate, User user, boolean isAdminOrAuditor) {
        StatementDto statement = generateStatement(accountId, fromDate, toDate, user, isAdminOrAuditor);

        StringBuilder sb = new StringBuilder();
        sb.append("LEDGERLINE OFFICIAL ACCOUNT STATEMENT\n");
        sb.append("Account Number:,").append(statement.getAccountNumber()).append("\n");
        sb.append("Account Name:,").append(statement.getAccountName()).append("\n");
        sb.append("Currency:,").append(statement.getCurrency()).append("\n");
        sb.append("Period Start:,").append(statement.getPeriodStart() != null ? statement.getPeriodStart() : "Inception").append("\n");
        sb.append("Period End:,").append(statement.getPeriodEnd()).append("\n");
        sb.append("Opening Balance:,").append(statement.getOpeningBalance()).append("\n");
        sb.append("Closing Balance:,").append(statement.getClosingBalance()).append("\n");
        sb.append("Total Credits:,").append(statement.getTotalCredits()).append("\n");
        sb.append("Total Debits:,").append(statement.getTotalDebits()).append("\n\n");

        sb.append("Date,Entry ID,Type,Amount,Running Balance\n");
        for (LedgerEntryDto entry : statement.getEntries()) {
            sb.append(entry.getCreatedAt()).append(",")
              .append(entry.getId()).append(",")
              .append(entry.getEntryType()).append(",")
              .append(entry.getAmount()).append(",")
              .append(entry.getRunningBalance()).append("\n");
        }

        return sb.toString();
    }
}
