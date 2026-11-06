package com.ledgerline.domain;

import com.ledgerline.domain.enums.EntryType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ledger_entries")
public class LedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id", nullable = false)
    private JournalEntry journalEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false, length = 8)
    private EntryType entryType;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "running_balance", nullable = false, precision = 19, scale = 4)
    private BigDecimal runningBalance;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public LedgerEntry() {}

    public LedgerEntry(JournalEntry journalEntry, Account account, EntryType entryType, BigDecimal amount, BigDecimal runningBalance) {
        this.journalEntry = journalEntry;
        this.account = account;
        this.entryType = entryType;
        this.amount = amount != null ? amount.setScale(4, RoundingMode.HALF_EVEN) : BigDecimal.ZERO;
        this.runningBalance = runningBalance != null ? runningBalance.setScale(4, RoundingMode.HALF_EVEN) : BigDecimal.ZERO;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public JournalEntry getJournalEntry() { return journalEntry; }
    public void setJournalEntry(JournalEntry journalEntry) { this.journalEntry = journalEntry; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public EntryType getEntryType() { return entryType; }
    public void setEntryType(EntryType entryType) { this.entryType = entryType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Ledger entry amount must be strictly positive: " + amount);
        }
        this.amount = amount.setScale(4, RoundingMode.HALF_EVEN);
    }

    public BigDecimal getRunningBalance() { return runningBalance; }
    public void setRunningBalance(BigDecimal runningBalance) {
        this.runningBalance = runningBalance != null ? runningBalance.setScale(4, RoundingMode.HALF_EVEN) : BigDecimal.ZERO;
    }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
