package com.ledgerline.controller;

import com.ledgerline.domain.User;
import com.ledgerline.domain.enums.AccountStatus;
import com.ledgerline.dto.request.AdjustmentApprovalDto;
import com.ledgerline.dto.request.AdjustmentRequestDto;
import com.ledgerline.dto.response.AccountDto;
import com.ledgerline.dto.response.AdjustmentResponseDto;
import com.ledgerline.dto.response.ApiResponse;
import com.ledgerline.dto.response.DashboardSummaryDto;
import com.ledgerline.dto.response.UserDto;
import com.ledgerline.repository.UserRepository;
import com.ledgerline.security.UserPrincipal;
import com.ledgerline.service.AccountService;
import com.ledgerline.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Administration", description = "Endpoints reserved for administrators: user management, account controls, adjustments, and system metrics.")
public class AdminController {

    private final AdminService adminService;
    private final AccountService accountService;
    private final UserRepository userRepository;

    public AdminController(AdminService adminService, AccountService accountService, UserRepository userRepository) {
        this.adminService = adminService;
        this.accountService = accountService;
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    @Operation(summary = "List all users", description = "Retrieves all registered users across the platform.")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers()));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Enable or disable a user", description = "Toggles user activation status.")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(
            @PathVariable UUID id,
            @RequestParam boolean enabled,
            @AuthenticationPrincipal UserPrincipal principal) {
        User admin = userRepository.findById(principal.getId()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success(adminService.updateUserStatus(id, enabled, admin)));
    }

    @GetMapping("/accounts")
    @Operation(summary = "List all accounts", description = "Retrieves all financial accounts across all users.")
    public ResponseEntity<ApiResponse<List<AccountDto>>> getAllAccounts() {
        return ResponseEntity.ok(ApiResponse.success(accountService.getAllAccounts()));
    }

    @PostMapping("/accounts/{id}/freeze")
    @Operation(summary = "Freeze account", description = "Sets account status to FROZEN, preventing debit and credit operations.")
    public ResponseEntity<ApiResponse<AccountDto>> freezeAccount(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User admin = userRepository.findById(principal.getId()).orElseThrow();
        AccountDto dto = accountService.updateAccountStatus(id, AccountStatus.FROZEN, admin);
        return ResponseEntity.ok(ApiResponse.success("Account frozen successfully", dto));
    }

    @PostMapping("/accounts/{id}/unfreeze")
    @Operation(summary = "Unfreeze account", description = "Restores account status to ACTIVE.")
    public ResponseEntity<ApiResponse<AccountDto>> unfreezeAccount(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User admin = userRepository.findById(principal.getId()).orElseThrow();
        AccountDto dto = accountService.updateAccountStatus(id, AccountStatus.ACTIVE, admin);
        return ResponseEntity.ok(ApiResponse.success("Account unfrozen successfully", dto));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard overview", description = "Provides global metrics and volume summaries.")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getAdminDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getSystemDashboardSummary()));
    }

    @GetMapping("/adjustments")
    @Operation(summary = "List adjustment requests", description = "Lists all submitted account adjustment requests.")
    public ResponseEntity<ApiResponse<List<AdjustmentResponseDto>>> getAdjustments() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllAdjustmentRequests()));
    }

    @PostMapping("/adjustments/request")
    @Operation(summary = "Submit adjustment request", description = "Creates a pending financial adjustment request for secondary review.")
    public ResponseEntity<ApiResponse<AdjustmentResponseDto>> requestAdjustment(
            @Valid @RequestBody AdjustmentRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User admin = userRepository.findById(principal.getId()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success(adminService.requestAdjustment(request, admin)));
    }

    @PostMapping("/adjustments/{id}/review")
    @Operation(summary = "Approve or reject adjustment", description = "Approves or rejects a financial adjustment, posting double-entry entries upon approval.")
    public ResponseEntity<ApiResponse<AdjustmentResponseDto>> reviewAdjustment(
            @PathVariable UUID id,
            @Valid @RequestBody AdjustmentApprovalDto approvalDto,
            @AuthenticationPrincipal UserPrincipal principal) {
        User admin = userRepository.findById(principal.getId()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success(adminService.reviewAdjustment(id, approvalDto, admin)));
    }
}
