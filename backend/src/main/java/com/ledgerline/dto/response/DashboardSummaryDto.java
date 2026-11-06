package com.ledgerline.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardSummaryDto {
    private BigDecimal totalBalance;
    private BigDecimal totalIncoming;
    private BigDecimal totalOutgoing;
    private long totalTransfers;
    private long pendingTransfers;
    private long failedTransfers;
    private List<TransactionDto> recentTransactions;
    private List<AccountDto> accounts;
    private Map<String, BigDecimal> monthlyVolume;

    public DashboardSummaryDto() {}

    public BigDecimal getTotalBalance() { return totalBalance; }
    public void setTotalBalance(BigDecimal totalBalance) { this.totalBalance = totalBalance; }

    public BigDecimal getTotalIncoming() { return totalIncoming; }
    public void setTotalIncoming(BigDecimal totalIncoming) { this.totalIncoming = totalIncoming; }

    public BigDecimal getTotalOutgoing() { return totalOutgoing; }
    public void setTotalOutgoing(BigDecimal totalOutgoing) { this.totalOutgoing = totalOutgoing; }

    public long getTotalTransfers() { return totalTransfers; }
    public void setTotalTransfers(long totalTransfers) { this.totalTransfers = totalTransfers; }

    public long getPendingTransfers() { return pendingTransfers; }
    public void setPendingTransfers(long pendingTransfers) { this.pendingTransfers = pendingTransfers; }

    public long getFailedTransfers() { return failedTransfers; }
    public void setFailedTransfers(long failedTransfers) { this.failedTransfers = failedTransfers; }

    public List<TransactionDto> getRecentTransactions() { return recentTransactions; }
    public void setRecentTransactions(List<TransactionDto> recentTransactions) { this.recentTransactions = recentTransactions; }

    public List<AccountDto> getAccounts() { return accounts; }
    public void setAccounts(List<AccountDto> accounts) { this.accounts = accounts; }

    public Map<String, BigDecimal> getMonthlyVolume() { return monthlyVolume; }
    public void setMonthlyVolume(Map<String, BigDecimal> monthlyVolume) { this.monthlyVolume = monthlyVolume; }
}
