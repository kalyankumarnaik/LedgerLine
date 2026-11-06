package com.ledgerline.controller;

import com.ledgerline.domain.User;
import com.ledgerline.dto.request.CreateAccountRequest;
import com.ledgerline.dto.request.UpdateTransactionLimitRequest;
import com.ledgerline.dto.response.AccountDto;
import com.ledgerline.dto.response.ApiResponse;
import com.ledgerline.dto.response.StatementDto;
import com.ledgerline.repository.UserRepository;
import com.ledgerline.security.UserPrincipal;
import com.ledgerline.service.AccountService;
import com.ledgerline.service.StatementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accounts")
@Tag(name = "Accounts", description = "Endpoints for managing financial accounts, limits, and statements.")
public class AccountController {

    private final AccountService accountService;
    private final StatementService statementService;
    private final UserRepository userRepository;

    public AccountController(AccountService accountService, StatementService statementService, UserRepository userRepository) {
        this.accountService = accountService;
        this.statementService = statementService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @Operation(summary = "Create a financial account", description = "Provisions a new account with zero balance and default limits.")
    public ResponseEntity<ApiResponse<AccountDto>> createAccount(@Valid @RequestBody CreateAccountRequest request,
                                                                 @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId()).orElseThrow();
        AccountDto dto = accountService.createAccount(request, user);
        return ResponseEntity.ok(ApiResponse.success("Account created successfully", dto));
    }

    @GetMapping
    @Operation(summary = "Get user accounts", description = "Lists all authorized accounts for the caller.")
    public ResponseEntity<ApiResponse<List<AccountDto>>> getMyAccounts(@AuthenticationPrincipal UserPrincipal principal) {
        List<AccountDto> accounts = accountService.getUserAccounts(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(accounts));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account details", description = "Retrieves metadata, limits, and materialized balance for an account.")
    public ResponseEntity<ApiResponse<AccountDto>> getAccountById(@PathVariable UUID id,
                                                                 @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId()).orElseThrow();
        boolean isAdminOrAuditor = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_AUDITOR"));

        AccountDto account = accountService.getAccountById(id, user, isAdminOrAuditor);
        return ResponseEntity.ok(ApiResponse.success(account));
    }

    @GetMapping("/{id}/statement")
    @Operation(summary = "Generate account statement", description = "Calculates statement entries and running balances over a date range.")
    public ResponseEntity<ApiResponse<StatementDto>> getStatement(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant toDate,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId()).orElseThrow();
        boolean isAdminOrAuditor = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_AUDITOR"));

        StatementDto statement = statementService.generateStatement(id, fromDate, toDate, user, isAdminOrAuditor);
        return ResponseEntity.ok(ApiResponse.success(statement));
    }

    @GetMapping("/{id}/statement/export")
    @Operation(summary = "Export statement as CSV", description = "Generates a downloadable CSV statement with ledger details.")
    public ResponseEntity<byte[]> exportStatementCsv(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant toDate,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId()).orElseThrow();
        boolean isAdminOrAuditor = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_AUDITOR"));

        String csvData = statementService.exportStatementCsv(id, fromDate, toDate, user, isAdminOrAuditor);
        byte[] bytes = csvData.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"statement-" + id + ".csv\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(bytes);
    }

    @PutMapping("/{id}/limits")
    @Operation(summary = "Update account limits", description = "Sets daily and per-transaction limits.")
    public ResponseEntity<ApiResponse<Void>> updateLimits(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTransactionLimitRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId()).orElseThrow();
        accountService.updateTransactionLimit(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Limits updated successfully", null));
    }
}
