package com.ledgerline.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class AdjustmentRequestDto {
    @NotNull(message = "Account ID is required")
    private UUID accountId;

    @NotBlank(message = "Adjustment type is required (CREDIT or DEBIT)")
    private String adjustmentType;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotBlank(message = "Reason is required")
    private String reason;

    public AdjustmentRequestDto() {}

    public AdjustmentRequestDto(UUID accountId, String adjustmentType, BigDecimal amount, String reason) {
        this.accountId = accountId;
        this.adjustmentType = adjustmentType;
        this.amount = amount;
        this.reason = reason;
    }

    public UUID getAccountId() { return accountId; }
    public void setAccountId(UUID accountId) { this.accountId = accountId; }

    public String getAdjustmentType() { return adjustmentType; }
    public void setAdjustmentType(String adjustmentType) { this.adjustmentType = adjustmentType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
