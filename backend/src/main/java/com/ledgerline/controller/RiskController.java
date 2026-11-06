package com.ledgerline.controller;

import com.ledgerline.domain.User;
import com.ledgerline.dto.response.ApiResponse;
import com.ledgerline.dto.response.RiskFlagDto;
import com.ledgerline.repository.UserRepository;
import com.ledgerline.security.UserPrincipal;
import com.ledgerline.service.RiskReviewEngine;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/risk")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Risk & Anomaly Engine", description = "Endpoints for monitoring and resolving rule-based financial risk flags.")
public class RiskController {

    private final RiskReviewEngine riskReviewEngine;
    private final UserRepository userRepository;

    public RiskController(RiskReviewEngine riskReviewEngine, UserRepository userRepository) {
        this.riskReviewEngine = riskReviewEngine;
        this.userRepository = userRepository;
    }

    @GetMapping("/flags")
    @Operation(summary = "List all risk flags", description = "Retrieves active and resolved anomaly detection flags.")
    public ResponseEntity<ApiResponse<List<RiskFlagDto>>> getFlags() {
        return ResponseEntity.ok(ApiResponse.success(riskReviewEngine.getAllFlags()));
    }

    @PostMapping("/flags/{id}/resolve")
    @Operation(summary = "Resolve a risk flag", description = "Marks a risk flag as reviewed and resolved by an administrator.")
    public ResponseEntity<ApiResponse<Void>> resolveFlag(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User admin = userRepository.findById(principal.getId()).orElseThrow();
        riskReviewEngine.resolveFlag(id, admin);
        return ResponseEntity.ok(ApiResponse.success("Risk flag marked as resolved", null));
    }
}
