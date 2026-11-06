package com.ledgerline.controller;

import com.ledgerline.domain.Account;
import com.ledgerline.domain.FinancialTransaction;
import com.ledgerline.domain.User;
import com.ledgerline.domain.enums.TransactionType;
import com.ledgerline.dto.request.DepositRequest;
import com.ledgerline.dto.request.TransferRequest;
import com.ledgerline.dto.request.WithdrawRequest;
import com.ledgerline.dto.response.AccountDto;
import com.ledgerline.dto.response.ApiResponse;
import com.ledgerline.dto.response.DashboardSummaryDto;
import com.ledgerline.dto.response.TransactionDto;
import com.ledgerline.exception.ResourceNotFoundException;
import com.ledgerline.repository.FinancialTransactionRepository;
import com.ledgerline.repository.UserRepository;
import com.ledgerline.security.UserPrincipal;
import com.ledgerline.service.AccountService;
import com.ledgerline.service.FinancialEngineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/transactions")
@Tag(name = "Transactions", description = "Endpoints for money transfers, deposits, withdrawals, and transaction history.")
public class TransactionController {

    private final FinancialEngineService financialEngineService;
    private final FinancialTransactionRepository transactionRepository;
    private final AccountService accountService;
    private final UserRepository userRepository;

    public TransactionController(FinancialEngineService financialEngineService,
                                 FinancialTransactionRepository transactionRepository,
                                 AccountService accountService,
                                 UserRepository userRepository) {
        this.financialEngineService = financialEngineService;
        this.transactionRepository = transactionRepository;
        this.accountService = accountService;
        this.userRepository = userRepository;
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transfer funds between accounts", description = "Executes an atomic double-entry transfer with row-level locks and idempotency protection.")
    public ResponseEntity<ApiResponse<TransactionDto>> transfer(
            @RequestHeader(value = "Idempotency-Key", required = false) String headerKey,
            @Valid @RequestBody TransferRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (headerKey != null && !headerKey.isBlank()) {
            request.setIdempotencyKey(headerKey);
        }
        User user = userRepository.findById(principal.getId()).orElseThrow();
        TransactionDto result = financialEngineService.executeTransfer(request, user);
        return ResponseEntity.ok(ApiResponse.success("Transfer completed successfully", result));
    }

    @PostMapping("/deposit")
    @Operation(summary = "Deposit funds into an account", description = "Deposits money into an authorized account, balanced against the reserve clearing account.")
    public ResponseEntity<ApiResponse<TransactionDto>> deposit(
            @RequestHeader(value = "Idempotency-Key", required = false) String headerKey,
            @Valid @RequestBody DepositRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (headerKey != null && !headerKey.isBlank()) {
            request.setIdempotencyKey(headerKey);
        }
        User user = userRepository.findById(principal.getId()).orElseThrow();
        TransactionDto result = financialEngineService.executeDeposit(request, user);
        return ResponseEntity.ok(ApiResponse.success("Deposit processed successfully", result));
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw funds from an account", description = "Disburses funds from an account, strictly verifying sufficient balance and account status.")
    public ResponseEntity<ApiResponse<TransactionDto>> withdraw(
            @RequestHeader(value = "Idempotency-Key", required = false) String headerKey,
            @Valid @RequestBody WithdrawRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (headerKey != null && !headerKey.isBlank()) {
            request.setIdempotencyKey(headerKey);
        }
        User user = userRepository.findById(principal.getId()).orElseThrow();
        TransactionDto result = financialEngineService.executeWithdraw(request, user);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal processed successfully", result));
    }

    @GetMapping
    @Operation(summary = "Get transaction history", description = "Fetches transaction history for the user's accounts.")
    public ResponseEntity<ApiResponse<List<TransactionDto>>> getTransactions(
            @RequestParam(required = false) UUID accountId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<FinancialTransaction> txList;
        if (accountId != null) {
            financialEngineService.verifyAccountAccess(accountId, principal.getId(), null);
            txList = transactionRepository.findAllByAccountIdOrderByCreatedAtDesc(accountId);
        } else {
            List<AccountDto> myAccounts = accountService.getUserAccounts(principal.getId());
            txList = new ArrayList<>();
            for (AccountDto acc : myAccounts) {
                txList.addAll(transactionRepository.findAllByAccountIdOrderByCreatedAtDesc(acc.getId()));
            }
            txList.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        }

        List<TransactionDto> dtos = txList.stream()
                .map(financialEngineService::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get transaction details", description = "Fetches transaction details by ID.")
    public ResponseEntity<ApiResponse<TransactionDto>> getTransactionById(@PathVariable UUID id) {
        FinancialTransaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
        return ResponseEntity.ok(ApiResponse.success(financialEngineService.mapToDto(tx)));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get user dashboard financial overview", description = "Aggregates total balance, incoming/outgoing money, and recent transactions.")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardSummary(@AuthenticationPrincipal UserPrincipal principal) {
        List<AccountDto> accounts = accountService.getUserAccounts(principal.getId());

        BigDecimal totalBalance = BigDecimal.ZERO;
        BigDecimal totalIncoming = BigDecimal.ZERO;
        BigDecimal totalOutgoing = BigDecimal.ZERO;

        List<TransactionDto> recentList = new ArrayList<>();

        for (AccountDto acc : accounts) {
            totalBalance = totalBalance.add(acc.getBalance() != null ? acc.getBalance() : BigDecimal.ZERO);
            List<FinancialTransaction> txs = transactionRepository.findAllByAccountIdOrderByCreatedAtDesc(acc.getId());
            for (FinancialTransaction tx : txs) {
                if (tx.getDestinationAccount() != null && tx.getDestinationAccount().getId().equals(acc.getId())) {
                    totalIncoming = totalIncoming.add(tx.getAmount());
                }
                if (tx.getSourceAccount() != null && tx.getSourceAccount().getId().equals(acc.getId())) {
                    totalOutgoing = totalOutgoing.add(tx.getAmount());
                }
                recentList.add(financialEngineService.mapToDto(tx));
            }
        }

        recentList.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        List<TransactionDto> topRecent = recentList.stream().limit(10).collect(Collectors.toList());

        DashboardSummaryDto summary = new DashboardSummaryDto();
        summary.setTotalBalance(totalBalance);
        summary.setTotalIncoming(totalIncoming);
        summary.setTotalOutgoing(totalOutgoing);
        summary.setTotalTransfers(recentList.size());
        summary.setAccounts(accounts);
        summary.setRecentTransactions(topRecent);

        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
