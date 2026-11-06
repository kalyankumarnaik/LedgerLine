package com.ledgerline.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "adjustment_approvals")
public class AdjustmentApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private AccountAdjustmentRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id", nullable = false)
    private User approver;

    @Column(nullable = false, length = 32)
    private String decision; // APPROVED or REJECTED

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public AdjustmentApproval() {}

    public AdjustmentApproval(AccountAdjustmentRequest request, User approver, String decision, String comments) {
        this.request = request;
        this.approver = approver;
        this.decision = decision;
        this.comments = comments;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public AccountAdjustmentRequest getRequest() { return request; }
    public void setRequest(AccountAdjustmentRequest request) { this.request = request; }

    public User getApprover() { return approver; }
    public void setApprover(User approver) { this.approver = approver; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
