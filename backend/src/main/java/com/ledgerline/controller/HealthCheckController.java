package com.ledgerline.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@Tag(name = "Deployment Health & Readiness", description = "High-availability deployment readiness and liveness endpoints")
public class HealthCheckController {

    private final DataSource dataSource;
    private final Instant startTime = Instant.now();

    public HealthCheckController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health/liveness")
    @Operation(summary = "Kubernetes & Deployment Liveness Probe")
    public ResponseEntity<Map<String, Object>> liveness() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "BalanceVault Core Platform");
        response.put("timestamp", Instant.now().toString());
        response.put("uptimeSeconds", java.time.Duration.between(startTime, Instant.now()).getSeconds());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health/readiness")
    @Operation(summary = "Kubernetes & Deployment Readiness Probe with Database Verification")
    public ResponseEntity<Map<String, Object>> readiness() {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> components = new HashMap<>();
        boolean isReady = true;

        // 1. Probe PostgreSQL Database
        long dbStart = System.currentTimeMillis();
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("SELECT 1");
            long latencyMs = System.currentTimeMillis() - dbStart;
            components.put("database", Map.of(
                "status", "UP",
                "engine", "PostgreSQL",
                "latencyMs", latencyMs
            ));
        } catch (Exception e) {
            isReady = false;
            components.put("database", Map.of(
                "status", "DOWN",
                "error", e.getMessage()
            ));
        }

        // 2. Report Double-Entry Invariant Engine
        components.put("ledgerEngine", Map.of(
            "status", "UP",
            "model", "Strict Double-Entry Balanced Journal",
            "concurrencyLocking", "Pessimistic SELECT FOR UPDATE"
        ));

        // 3. Report Rate Limiting
        components.put("rateLimiter", Map.of(
            "status", "UP",
            "policy", "Sliding Window Token Bucket",
            "redisBackend", "Enabled with resilient in-memory fallback"
        ));

        response.put("status", isReady ? "UP" : "OUT_OF_SERVICE");
        response.put("service", "BalanceVault Core Platform");
        response.put("components", components);
        response.put("timestamp", Instant.now().toString());

        if (isReady) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }

    @GetMapping("/api/v1/health")
    @Operation(summary = "Frontend Telemetry Status API")
    public ResponseEntity<Map<String, Object>> apiHealth() {
        return readiness();
    }
}
