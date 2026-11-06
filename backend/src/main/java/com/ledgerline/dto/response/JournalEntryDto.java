package com.ledgerline.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class JournalEntryDto {
    private UUID id;
    private UUID transactionId;
    private String entryReference;
    private String description;
    private Instant postedAt;
    private List<LedgerEntryDto> ledgerEntries;

    public JournalEntryDto() {}

    public JournalEntryDto(UUID id, UUID transactionId, String entryReference, String description, Instant postedAt, List<LedgerEntryDto> ledgerEntries) {
        this.id = id;
        this.transactionId = transactionId;
        this.entryReference = entryReference;
        this.description = description;
        this.postedAt = postedAt;
        this.ledgerEntries = ledgerEntries;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTransactionId() { return transactionId; }
    public void setTransactionId(UUID transactionId) { this.transactionId = transactionId; }

    public String getEntryReference() { return entryReference; }
    public void setEntryReference(String entryReference) { this.entryReference = entryReference; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getPostedAt() { return postedAt; }
    public void setPostedAt(Instant postedAt) { this.postedAt = postedAt; }

    public List<LedgerEntryDto> getLedgerEntries() { return ledgerEntries; }
    public void setLedgerEntries(List<LedgerEntryDto> ledgerEntries) { this.ledgerEntries = ledgerEntries; }
}
