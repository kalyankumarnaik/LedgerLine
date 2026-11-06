package com.ledgerline.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class FailedAttemptDto {
    private UUID id;
    private String correlationId;
    private String username;
    private UUID accountId;
    private String requestedOperation;
    private BigDecimal amount;
    private String idempotencyKey;
    private String failureReason;
    private Instant createdAt;

    public FailedAttemptDto() {}

    public FailedAttemptDto(UUID id, String correlationId, String username, UUID accountId,
                            String requestedOperation, BigDecimal amount, String idempotencyKey,
                            String failureReason, Instant createdAt) {
        this.id = id;
        this.correlationId = correlationId;
        this.username = username;
        this.accountId = accountId;
        this.requestedOperation = requestedOperation;
        this.amount = amount;
        this.idempotencyKey = idempotencyKey;
        this.failureReason = failureReason;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public UUID getAccountId() { return accountId; }
    public void setAccountId(UUID accountId) { this.accountId = accountId; }

    public String getRequestedOperation() { return requestedOperation; }
    public void setRequestedOperation(String requestedOperation) { this.requestedOperation = requestedOperation; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
