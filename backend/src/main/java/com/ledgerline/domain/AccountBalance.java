package com.ledgerline.domain;

import jakarta.persistence.*;
import org.springframework.data.domain.Persistable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "account_balances")
public class AccountBalance implements Persistable<UUID> {

    @Id
    @Column(name = "account_id")
    private UUID accountId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal balance = BigDecimal.ZERO.setScale(4, RoundingMode.HALF_EVEN);

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @Column(name = "last_updated", nullable = false)
    private Instant lastUpdated = Instant.now();

    @Transient
    private boolean isNew = true;

    @Override
    public UUID getId() {
        return accountId;
    }

    @Override
    public boolean isNew() {
        return isNew || version == null || version == 0L;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }

    public AccountBalance() {}

    public AccountBalance(Account account, BigDecimal initialBalance) {
        this.account = account;
        if (account != null && account.getId() != null) {
            this.accountId = account.getId();
        }
        this.balance = initialBalance != null ? initialBalance.setScale(4, RoundingMode.HALF_EVEN) : BigDecimal.ZERO.setScale(4, RoundingMode.HALF_EVEN);
        this.lastUpdated = Instant.now();
    }

    public UUID getAccountId() { return accountId; }
    public void setAccountId(UUID accountId) { this.accountId = accountId; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) {
        this.account = account;
        if (account != null && account.getId() != null) {
            this.accountId = account.getId();
        }
    }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) {
        if (balance == null || balance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Account balance cannot be negative or null: " + balance);
        }
        this.balance = balance.setScale(4, RoundingMode.HALF_EVEN);
        this.lastUpdated = Instant.now();
    }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public Instant getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Instant lastUpdated) { this.lastUpdated = lastUpdated; }
}
