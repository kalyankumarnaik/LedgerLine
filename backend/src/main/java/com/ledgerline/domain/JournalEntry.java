package com.ledgerline.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "journal_entries")
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false, unique = true)
    private FinancialTransaction transaction;

    @Column(name = "entry_reference", nullable = false, unique = true, length = 64)
    private String entryReference;

    @Column(length = 255)
    private String description;

    @Column(name = "posted_at", nullable = false, updatable = false)
    private Instant postedAt = Instant.now();

    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LedgerEntry> ledgerEntries = new ArrayList<>();

    public JournalEntry() {}

    public JournalEntry(FinancialTransaction transaction, String entryReference, String description) {
        this.transaction = transaction;
        this.entryReference = entryReference;
        this.description = description;
        this.postedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public FinancialTransaction getTransaction() { return transaction; }
    public void setTransaction(FinancialTransaction transaction) { this.transaction = transaction; }

    public String getEntryReference() { return entryReference; }
    public void setEntryReference(String entryReference) { this.entryReference = entryReference; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getPostedAt() { return postedAt; }
    public void setPostedAt(Instant postedAt) { this.postedAt = postedAt; }

    public List<LedgerEntry> getLedgerEntries() { return ledgerEntries; }
    public void setLedgerEntries(List<LedgerEntry> ledgerEntries) { this.ledgerEntries = ledgerEntries; }
}
