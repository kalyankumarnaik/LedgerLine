package com.ledgerline.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transaction_limits")
public class TransactionLimit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;

    @Column(name = "daily_limit", nullable = false, precision = 19, scale = 4)
    private BigDecimal dailyLimit = new BigDecimal("100000.0000");

    @Column(name = "per_transaction_limit", nullable = false, precision = 19, scale = 4)
    private BigDecimal perTransactionLimit = new BigDecimal("50000.0000");

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public TransactionLimit() {}

    public TransactionLimit(Account account, BigDecimal dailyLimit, BigDecimal perTransactionLimit) {
        this.account = account;
        this.dailyLimit = dailyLimit.setScale(4, RoundingMode.HALF_EVEN);
        this.perTransactionLimit = perTransactionLimit.setScale(4, RoundingMode.HALF_EVEN);
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public BigDecimal getDailyLimit() { return dailyLimit; }
    public void setDailyLimit(BigDecimal dailyLimit) {
        this.dailyLimit = dailyLimit.setScale(4, RoundingMode.HALF_EVEN);
        this.updatedAt = Instant.now();
    }

    public BigDecimal getPerTransactionLimit() { return perTransactionLimit; }
    public void setPerTransactionLimit(BigDecimal perTransactionLimit) {
        this.perTransactionLimit = perTransactionLimit.setScale(4, RoundingMode.HALF_EVEN);
        this.updatedAt = Instant.now();
    }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
