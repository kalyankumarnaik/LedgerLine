package com.ledgerline.dto.response;

import com.ledgerline.domain.enums.AccountStatus;
import com.ledgerline.domain.enums.AccountType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class AccountDto {
    private UUID id;
    private String accountNumber;
    private UUID userId;
    private String ownerName;
    private String name;
    private AccountType accountType;
    private AccountStatus status;
    private String currency;
    private BigDecimal balance;
    private BigDecimal dailyLimit;
    private BigDecimal perTransactionLimit;
    private Instant createdAt;

    public AccountDto() {}

    public AccountDto(UUID id, String accountNumber, UUID userId, String ownerName, String name,
                      AccountType accountType, AccountStatus status, String currency,
                      BigDecimal balance, BigDecimal dailyLimit, BigDecimal perTransactionLimit,
                      Instant createdAt) {
        this.id = id;
        this.accountNumber = accountNumber;
        this.userId = userId;
        this.ownerName = ownerName;
        this.name = name;
        this.accountType = accountType;
        this.status = status;
        this.currency = currency;
        this.balance = balance;
        this.dailyLimit = dailyLimit;
        this.perTransactionLimit = perTransactionLimit;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public AccountType getAccountType() { return accountType; }
    public void setAccountType(AccountType accountType) { this.accountType = accountType; }

    public AccountStatus getStatus() { return status; }
    public void setStatus(AccountStatus status) { this.status = status; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public BigDecimal getDailyLimit() { return dailyLimit; }
    public void setDailyLimit(BigDecimal dailyLimit) { this.dailyLimit = dailyLimit; }

    public BigDecimal getPerTransactionLimit() { return perTransactionLimit; }
    public void setPerTransactionLimit(BigDecimal perTransactionLimit) { this.perTransactionLimit = perTransactionLimit; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
