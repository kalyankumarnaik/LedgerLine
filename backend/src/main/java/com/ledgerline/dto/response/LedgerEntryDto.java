package com.ledgerline.dto.response;

import com.ledgerline.domain.enums.EntryType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class LedgerEntryDto {
    private UUID id;
    private UUID accountId;
    private String accountNumber;
    private EntryType entryType;
    private BigDecimal amount;
    private BigDecimal runningBalance;
    private Instant createdAt;

    public LedgerEntryDto() {}

    public LedgerEntryDto(UUID id, UUID accountId, String accountNumber, EntryType entryType, BigDecimal amount, BigDecimal runningBalance, Instant createdAt) {
        this.id = id;
        this.accountId = accountId;
        this.accountNumber = accountNumber;
        this.entryType = entryType;
        this.amount = amount;
        this.runningBalance = runningBalance;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getAccountId() { return accountId; }
    public void setAccountId(UUID accountId) { this.accountId = accountId; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public EntryType getEntryType() { return entryType; }
    public void setEntryType(EntryType entryType) { this.entryType = entryType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getRunningBalance() { return runningBalance; }
    public void setRunningBalance(BigDecimal runningBalance) { this.runningBalance = runningBalance; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
