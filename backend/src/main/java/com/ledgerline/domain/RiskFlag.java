package com.ledgerline.domain;

import com.ledgerline.domain.enums.RiskSeverity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "risk_flags")
public class RiskFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private FinancialTransaction transaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private RiskSeverity severity;

    @Column(name = "rule_name", nullable = false, length = 64)
    private String ruleName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean resolved = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public RiskFlag() {}

    public RiskFlag(FinancialTransaction transaction, Account account, RiskSeverity severity, String ruleName, String description) {
        this.transaction = transaction;
        this.account = account;
        this.severity = severity;
        this.ruleName = ruleName;
        this.description = description;
        this.resolved = false;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public FinancialTransaction getTransaction() { return transaction; }
    public void setTransaction(FinancialTransaction transaction) { this.transaction = transaction; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public RiskSeverity getSeverity() { return severity; }
    public void setSeverity(RiskSeverity severity) { this.severity = severity; }

    public String getRuleName() { return ruleName; }
    public void setRuleName(String ruleName) { this.ruleName = ruleName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isResolved() { return resolved; }
    public void setResolved(boolean resolved) { this.resolved = resolved; }

    public User getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(User resolvedBy) { this.resolvedBy = resolvedBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
