package com.ledgerline.domain;

import com.ledgerline.domain.enums.AdjustmentStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "account_adjustment_requests")
public class AccountAdjustmentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "adjustment_type", nullable = false, length = 32)
    private String adjustmentType; // CREDIT or DEBIT

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AdjustmentStatus status = AdjustmentStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    public AccountAdjustmentRequest() {}

    public AccountAdjustmentRequest(Account account, String adjustmentType, BigDecimal amount, String reason, User requestedBy) {
        this.account = account;
        this.adjustmentType = adjustmentType;
        this.amount = amount != null ? amount.setScale(4, RoundingMode.HALF_EVEN) : BigDecimal.ZERO;
        this.reason = reason;
        this.requestedBy = requestedBy;
        this.status = AdjustmentStatus.PENDING;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public String getAdjustmentType() { return adjustmentType; }
    public void setAdjustmentType(String adjustmentType) { this.adjustmentType = adjustmentType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) {
        this.amount = amount != null ? amount.setScale(4, RoundingMode.HALF_EVEN) : BigDecimal.ZERO;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public AdjustmentStatus getStatus() { return status; }
    public void setStatus(AdjustmentStatus status) { this.status = status; }

    public User getRequestedBy() { return requestedBy; }
    public void setRequestedBy(User requestedBy) { this.requestedBy = requestedBy; }

    public User getApprovedBy() { return approvedBy; }
    public void setApprovedBy(User approvedBy) { this.approvedBy = approvedBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
}
