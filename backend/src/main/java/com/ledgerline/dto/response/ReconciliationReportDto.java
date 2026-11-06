package com.ledgerline.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public class ReconciliationReportDto {
    private Instant verifiedAt;
    private int totalAccountsChecked;
    private int balancedAccountsCount;
    private int discrepancyCount;
    private int totalJournalEntriesChecked;
    private int balancedJournalEntriesCount;
    private boolean fullyReconciled;
    private String statusMessage;
    private List<Map<String, Object>> accountDiscrepancies;
    private List<Map<String, Object>> unbalancedJournalEntries;

    public ReconciliationReportDto() {}

    public Instant getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }

    public int getTotalAccountsChecked() { return totalAccountsChecked; }
    public void setTotalAccountsChecked(int totalAccountsChecked) { this.totalAccountsChecked = totalAccountsChecked; }

    public int getBalancedAccountsCount() { return balancedAccountsCount; }
    public void setBalancedAccountsCount(int balancedAccountsCount) { this.balancedAccountsCount = balancedAccountsCount; }

    public int getDiscrepancyCount() { return discrepancyCount; }
    public void setDiscrepancyCount(int discrepancyCount) { this.discrepancyCount = discrepancyCount; }

    public int getTotalJournalEntriesChecked() { return totalJournalEntriesChecked; }
    public void setTotalJournalEntriesChecked(int totalJournalEntriesChecked) { this.totalJournalEntriesChecked = totalJournalEntriesChecked; }

    public int getBalancedJournalEntriesCount() { return balancedJournalEntriesCount; }
    public void setBalancedJournalEntriesCount(int balancedJournalEntriesCount) { this.balancedJournalEntriesCount = balancedJournalEntriesCount; }

    public boolean isFullyReconciled() { return fullyReconciled; }
    public void setFullyReconciled(boolean fullyReconciled) { this.fullyReconciled = fullyReconciled; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public List<Map<String, Object>> getAccountDiscrepancies() { return accountDiscrepancies; }
    public void setAccountDiscrepancies(List<Map<String, Object>> accountDiscrepancies) { this.accountDiscrepancies = accountDiscrepancies; }

    public List<Map<String, Object>> getUnbalancedJournalEntries() { return unbalancedJournalEntries; }
    public void setUnbalancedJournalEntries(List<Map<String, Object>> unbalancedJournalEntries) { this.unbalancedJournalEntries = unbalancedJournalEntries; }
}
