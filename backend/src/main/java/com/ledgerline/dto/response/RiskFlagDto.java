package com.ledgerline.dto.response;

import com.ledgerline.domain.enums.RiskSeverity;

import java.time.Instant;
import java.util.UUID;

public class RiskFlagDto {
    private UUID id;
    private UUID transactionId;
    private UUID accountId;
    private RiskSeverity severity;
    private String ruleName;
    private String description;
    private boolean resolved;
    private String resolvedByUsername;
    private Instant createdAt;

    public RiskFlagDto() {}

    public RiskFlagDto(UUID id, UUID transactionId, UUID accountId, RiskSeverity severity,
                       String ruleName, String description, boolean resolved,
                       String resolvedByUsername, Instant createdAt) {
        this.id = id;
        this.transactionId = transactionId;
        this.accountId = accountId;
        this.severity = severity;
        this.ruleName = ruleName;
        this.description = description;
        this.resolved = resolved;
        this.resolvedByUsername = resolvedByUsername;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTransactionId() { return transactionId; }
    public void setTransactionId(UUID transactionId) { this.transactionId = transactionId; }

    public UUID getAccountId() { return accountId; }
    public void setAccountId(UUID accountId) { this.accountId = accountId; }

    public RiskSeverity getSeverity() { return severity; }
    public void setSeverity(RiskSeverity severity) { this.severity = severity; }

    public String getRuleName() { return ruleName; }
    public void setRuleName(String ruleName) { this.ruleName = ruleName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isResolved() { return resolved; }
    public void setResolved(boolean resolved) { this.resolved = resolved; }

    public String getResolvedByUsername() { return resolvedByUsername; }
    public void setResolvedByUsername(String resolvedByUsername) { this.resolvedByUsername = resolvedByUsername; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
