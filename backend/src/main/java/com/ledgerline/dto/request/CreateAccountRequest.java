package com.ledgerline.dto.request;

import com.ledgerline.domain.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateAccountRequest {
    @NotBlank(message = "Account name is required")
    @Size(min = 2, max = 128, message = "Account name must be between 2 and 128 characters")
    private String name;

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    private String currency = "INR";

    public CreateAccountRequest() {}

    public CreateAccountRequest(String name, AccountType accountType, String currency) {
        this.name = name;
        this.accountType = accountType;
        this.currency = currency != null ? currency : "INR";
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public AccountType getAccountType() { return accountType; }
    public void setAccountType(AccountType accountType) { this.accountType = accountType; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
