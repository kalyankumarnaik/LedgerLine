package com.ledgerline.domain;

import com.ledgerline.domain.enums.IdempotencyStatus;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "idempotency_records", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_idempotency_key", columnNames = {"user_id", "idempotency_key"})
})
public class IdempotencyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "idempotency_key", nullable = false, length = 128)
    private String idempotencyKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "operation_type", nullable = false, length = 64)
    private String operationType;

    @Column(name = "request_hash", nullable = false, length = 64)
    private String requestHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private IdempotencyStatus status = IdempotencyStatus.PROCESSING;

    @Column(name = "response_payload", columnDefinition = "TEXT")
    private String responsePayload;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    public IdempotencyRecord() {}

    public IdempotencyRecord(String idempotencyKey, User user, String operationType, String requestHash, Instant expiresAt) {
        this.idempotencyKey = idempotencyKey;
        this.user = user;
        this.operationType = operationType;
        this.requestHash = requestHash;
        this.status = IdempotencyStatus.PROCESSING;
        this.createdAt = Instant.now();
        this.expiresAt = expiresAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setId(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getOperationType() { return operationType; }
    public void setOperationType(String operationType) { this.operationType = operationType; }

    public String getRequestHash() { return requestHash; }
    public void setRequestHash(String requestHash) { this.requestHash = requestHash; }

    public IdempotencyStatus getStatus() { return status; }
    public void setStatus(IdempotencyStatus status) { this.status = status; }

    public String getResponsePayload() { return responsePayload; }
    public void setResponsePayload(String responsePayload) { this.responsePayload = responsePayload; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
