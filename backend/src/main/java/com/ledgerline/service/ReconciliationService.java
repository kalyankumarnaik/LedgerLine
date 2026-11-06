package com.ledgerline.service;

import com.ledgerline.domain.Account;
import com.ledgerline.domain.AccountBalance;
import com.ledgerline.domain.JournalEntry;
import com.ledgerline.domain.LedgerEntry;
import com.ledgerline.domain.enums.EntryType;
import com.ledgerline.dto.response.ReconciliationReportDto;
import com.ledgerline.repository.AccountBalanceRepository;
import com.ledgerline.repository.AccountRepository;
import com.ledgerline.repository.JournalEntryRepository;
import com.ledgerline.repository.LedgerEntryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
public class ReconciliationService {

    private static final Logger log = LoggerFactory.getLogger(ReconciliationService.class);

    private final AccountRepository accountRepository;
    private final AccountBalanceRepository accountBalanceRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    public ReconciliationService(AccountRepository accountRepository,
                                 AccountBalanceRepository accountBalanceRepository,
                                 JournalEntryRepository journalEntryRepository,
                                 LedgerEntryRepository ledgerEntryRepository) {
        this.accountRepository = accountRepository;
        this.accountBalanceRepository = accountBalanceRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
    }

    @Transactional(readOnly = true)
    public ReconciliationReportDto runFullReconciliation() {
        log.info("Starting complete financial reconciliation audit run...");
        ReconciliationReportDto report = new ReconciliationReportDto();
        report.setVerifiedAt(Instant.now());

        List<Account> accounts = accountRepository.findAll();
        report.setTotalAccountsChecked(accounts.size());

        int balancedAccounts = 0;
        int discrepancies = 0;
        List<Map<String, Object>> discrepancyList = new ArrayList<>();

        for (Account account : accounts) {
            Optional<AccountBalance> balanceOpt = accountBalanceRepository.findByAccountId(account.getId());
            BigDecimal materialized = balanceOpt.map(AccountBalance::getBalance).orElse(BigDecimal.ZERO);

            // Recompute balance directly from the immutable append-only ledger
            BigDecimal ledgerDerived = ledgerEntryRepository.calculateReconciledBalance(account.getId());

            // Compare with 4 decimal places
            if (materialized.compareTo(ledgerDerived) == 0) {
                balancedAccounts++;
            } else {
                discrepancies++;
                Map<String, Object> discrepancy = new HashMap<>();
                discrepancy.put("accountId", account.getId());
                discrepancy.put("accountNumber", account.getAccountNumber());
                discrepancy.put("accountName", account.getName());
                discrepancy.put("materializedBalance", materialized);
                discrepancy.put("ledgerDerivedBalance", ledgerDerived);
                discrepancy.put("variance", materialized.subtract(ledgerDerived));
                discrepancyList.add(discrepancy);
                log.error("AUDIT DISCREPANCY DETECTED for account {}: Materialized={}, Ledger={}",
                        account.getAccountNumber(), materialized, ledgerDerived);
            }
        }

        report.setBalancedAccountsCount(balancedAccounts);
        report.setDiscrepancyCount(discrepancies);
        report.setAccountDiscrepancies(discrepancyList);

        // Check journal entries integrity: debit sum == credit sum for all posted journal entries
        List<JournalEntry> journalEntries = journalEntryRepository.findAll();
        report.setTotalJournalEntriesChecked(journalEntries.size());

        int balancedJournals = 0;
        List<Map<String, Object>> unbalancedJournals = new ArrayList<>();

        for (JournalEntry jrn : journalEntries) {
            List<LedgerEntry> postings = ledgerEntryRepository.findAllByJournalEntryId(jrn.getId());
            BigDecimal totalDebit = BigDecimal.ZERO;
            BigDecimal totalCredit = BigDecimal.ZERO;

            for (LedgerEntry p : postings) {
                if (p.getEntryType() == EntryType.DEBIT) {
                    totalDebit = totalDebit.add(p.getAmount());
                } else if (p.getEntryType() == EntryType.CREDIT) {
                    totalCredit = totalCredit.add(p.getAmount());
                }
            }

            if (totalDebit.compareTo(totalCredit) == 0 && totalDebit.compareTo(BigDecimal.ZERO) > 0) {
                balancedJournals++;
            } else {
                Map<String, Object> err = new HashMap<>();
                err.put("journalEntryId", jrn.getId());
                err.put("entryReference", jrn.getEntryReference());
                err.put("totalDebit", totalDebit);
                err.put("totalCredit", totalCredit);
                err.put("imbalance", totalDebit.subtract(totalCredit));
                unbalancedJournals.add(err);
                log.error("CRITICAL JOURNAL IMBALANCE in entry {}: Debit={}, Credit={}",
                        jrn.getEntryReference(), totalDebit, totalCredit);
            }
        }

        report.setBalancedJournalEntriesCount(balancedJournals);
        report.setUnbalancedJournalEntries(unbalancedJournals);

        boolean fullyReconciled = (discrepancies == 0) && (unbalancedJournals.isEmpty());
        report.setFullyReconciled(fullyReconciled);
        report.setStatusMessage(fullyReconciled
                ? "All ledger postings are fully verified and reconciled. 0 discrepancies detected."
                : "Reconciliation detected " + discrepancies + " account balance discrepancies and " + unbalancedJournals.size() + " journal imbalances!");

        log.info("Reconciliation run completed. Result: {}", report.getStatusMessage());
        return report;
    }
}
