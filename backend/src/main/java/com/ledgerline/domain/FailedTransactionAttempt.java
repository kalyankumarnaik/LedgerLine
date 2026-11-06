package com.ledgerline.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "failed_transaction_attempts")
public class FailedTransactionAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "correlation_id", nullable = false, length = 64)
    private String correlationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiating_user_id")
    private User initiatingUser;

    @Column(name = "account_id")
    private UUID accountId;

    @Column(name = "requested_operation", nullable = false, length = 64)
    private String requestedOperation;

    @Column(precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "idempotency_key", length = 128)
    private String idempotencyKey;

    @Column(name = "failure_reason", nullable = false, length = 512)
    private String failureReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public FailedTransactionAttempt() {}

    public FailedTransactionAttempt(String correlationId, User initiatingUser, UUID accountId,
                                    String requestedOperation, BigDecimal amount,
                                    String idempotencyKey, String failureReason) {
        this.correlationId = correlationId;
        this.initiatingUser = initiatingUser;
        this.accountId = accountId;
        this.requestedOperation = requestedOperation;
        this.amount = amount != null ? amount.setScale(4, RoundingMode.HALF_EVEN) : null;
        this.idempotencyKey = idempotencyKey;
        this.failureReason = failureReason;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public User getInitiatingUser() { return initiatingUser; }
    public void setInitiatingUser(User initiatingUser) { this.initiatingUser = initiatingUser; }

    public UUID getAccountId() { return accountId; }
    public void setAccountId(UUID accountId) { this.accountId = accountId; }

    public String getRequestedOperation() { return requestedOperation; }
    public void setRequestedOperation(String requestedOperation) { this.requestedOperation = requestedOperation; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) {
        this.amount = amount != null ? amount.setScale(4, RoundingMode.HALF_EVEN) : null;
    }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
