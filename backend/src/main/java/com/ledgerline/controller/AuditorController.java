package com.ledgerline.controller;

import com.ledgerline.domain.AuditEvent;
import com.ledgerline.domain.JournalEntry;
import com.ledgerline.domain.LedgerEntry;
import com.ledgerline.dto.response.*;
import com.ledgerline.repository.JournalEntryRepository;
import com.ledgerline.repository.LedgerEntryRepository;
import com.ledgerline.service.AuditService;
import com.ledgerline.service.ReconciliationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auditor")
@PreAuthorize("hasAnyRole('AUDITOR', 'ADMIN')")
@Tag(name = "Auditing", description = "Read-only endpoints for independent auditors: immutable ledger exploration, journals, failed attempts, and reconciliation.")
public class AuditorController {

    private final JournalEntryRepository journalEntryRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final AuditService auditService;
    private final ReconciliationService reconciliationService;

    public AuditorController(JournalEntryRepository journalEntryRepository,
                             LedgerEntryRepository ledgerEntryRepository,
                             AuditService auditService,
                             ReconciliationService reconciliationService) {
        this.journalEntryRepository = journalEntryRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.auditService = auditService;
        this.reconciliationService = reconciliationService;
    }

    @GetMapping("/reconciliation")
    @Operation(summary = "Perform complete reconciliation verification", description = "Audits every account balance against ledger entries and checks journal debit/credit parity.")
    public ResponseEntity<ApiResponse<ReconciliationReportDto>> getReconciliationReport() {
        return ResponseEntity.ok(ApiResponse.success(reconciliationService.runFullReconciliation()));
    }

    @GetMapping("/journal")
    @Operation(summary = "Explore journal entries", description = "Lists posted double-entry journal records.")
    public ResponseEntity<ApiResponse<List<JournalEntryDto>>> getJournalEntries() {
        List<JournalEntry> journals = journalEntryRepository.findAllByOrderByPostedAtDesc();
        List<JournalEntryDto> dtos = journals.stream().map(j -> {
            List<LedgerEntry> entries = ledgerEntryRepository.findAllByJournalEntryId(j.getId());
            List<LedgerEntryDto> entryDtos = entries.stream()
                    .map(e -> new LedgerEntryDto(e.getId(), e.getAccount().getId(), e.getAccount().getAccountNumber(),
                            e.getEntryType(), e.getAmount(), e.getRunningBalance(), e.getCreatedAt()))
                    .collect(Collectors.toList());
            return new JournalEntryDto(j.getId(), j.getTransaction().getId(), j.getEntryReference(), j.getDescription(), j.getPostedAt(), entryDtos);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/ledger")
    @Operation(summary = "Inspect raw ledger postings", description = "Explores raw, immutable ledger entries across all accounts or a specific account.")
    public ResponseEntity<ApiResponse<List<LedgerEntryDto>>> getLedgerEntries(@RequestParam(required = false) UUID accountId) {
        List<LedgerEntry> entries;
        if (accountId != null) {
            entries = ledgerEntryRepository.findAllByAccountIdOrderByCreatedAtDesc(accountId);
        } else {
            entries = ledgerEntryRepository.findAll();
            entries.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        }

        List<LedgerEntryDto> dtos = entries.stream()
                .map(e -> new LedgerEntryDto(e.getId(), e.getAccount().getId(), e.getAccount().getAccountNumber(),
                        e.getEntryType(), e.getAmount(), e.getRunningBalance(), e.getCreatedAt()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/failed-attempts")
    @Operation(summary = "View failed transaction audit trail", description = "Retrieves all refused financial attempts with correlation IDs and failure reasons.")
    public ResponseEntity<ApiResponse<List<FailedAttemptDto>>> getFailedAttempts() {
        return ResponseEntity.ok(ApiResponse.success(auditService.getFailedAttempts()));
    }

    @GetMapping("/audit-events")
    @Operation(summary = "View system security audit trail", description = "Lists all administrative, authentication, and state change audit records.")
    public ResponseEntity<ApiResponse<List<AuditEvent>>> getAuditEvents() {
        return ResponseEntity.ok(ApiResponse.success(auditService.getAuditEvents()));
    }
}
