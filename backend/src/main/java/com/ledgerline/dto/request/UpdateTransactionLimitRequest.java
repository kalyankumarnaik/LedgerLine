package com.ledgerline.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class UpdateTransactionLimitRequest {
    @NotNull(message = "Daily limit is required")
    @DecimalMin(value = "0.00", message = "Daily limit cannot be negative")
    private BigDecimal dailyLimit;

    @NotNull(message = "Per transaction limit is required")
    @DecimalMin(value = "0.00", message = "Per transaction limit cannot be negative")
    private BigDecimal perTransactionLimit;

    public UpdateTransactionLimitRequest() {}

    public UpdateTransactionLimitRequest(BigDecimal dailyLimit, BigDecimal perTransactionLimit) {
        this.dailyLimit = dailyLimit;
        this.perTransactionLimit = perTransactionLimit;
    }

    public BigDecimal getDailyLimit() { return dailyLimit; }
    public void setDailyLimit(BigDecimal dailyLimit) { this.dailyLimit = dailyLimit; }

    public BigDecimal getPerTransactionLimit() { return perTransactionLimit; }
    public void setPerTransactionLimit(BigDecimal perTransactionLimit) { this.perTransactionLimit = perTransactionLimit; }
}
