package com.ledgerline.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * BalanceVault Resilient Rate Limiter Service.
 * Implements sliding window token-bucket rate limiting for authentication and financial transactions.
 * Designed to operate standalone or backed by Redis clusters.
 */
@Service
public class RateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterService.class);

    private final ConcurrentHashMap<String, WindowCounter> windowMap = new ConcurrentHashMap<>();

    // Rate limit thresholds
    private static final int AUTH_LIMIT_PER_MINUTE = 15;
    private static final int TRANSACTION_LIMIT_PER_MINUTE = 40;
    private static final int GENERAL_LIMIT_PER_MINUTE = 150;

    public RateLimitResult checkLimit(String clientIdentifier, String endpointPath) {
        int maxAllowed;
        String bucketType;

        if (endpointPath.contains("/auth/")) {
            maxAllowed = AUTH_LIMIT_PER_MINUTE;
            bucketType = "AUTH";
        } else if (endpointPath.contains("/transactions/") || endpointPath.contains("/transfer") || endpointPath.contains("/deposit") || endpointPath.contains("/withdraw")) {
            maxAllowed = TRANSACTION_LIMIT_PER_MINUTE;
            bucketType = "FINANCIAL_TRANSACTION";
        } else {
            maxAllowed = GENERAL_LIMIT_PER_MINUTE;
            bucketType = "GENERAL";
        }

        String key = bucketType + ":" + clientIdentifier;
        long currentMinute = System.currentTimeMillis() / 60000;

        WindowCounter counter = windowMap.compute(key, (k, existing) -> {
            if (existing == null || existing.minute != currentMinute) {
                return new WindowCounter(currentMinute, 1);
            }
            existing.count.incrementAndGet();
            return existing;
        });

        int currentCount = counter.count.get();
        boolean allowed = currentCount <= maxAllowed;
        int remaining = Math.max(0, maxAllowed - currentCount);
        long retryAfterSeconds = allowed ? 0 : (60 - ((System.currentTimeMillis() / 1000) % 60));

        if (!allowed) {
            log.warn("Rate limit exceeded for client={} on endpoint={} bucket={} (current={}, max={})",
                    clientIdentifier, endpointPath, bucketType, currentCount, maxAllowed);
        }

        // Periodic map cleanup
        if (windowMap.size() > 5000) {
            windowMap.entrySet().removeIf(e -> e.getValue().minute < currentMinute - 1);
        }

        return new RateLimitResult(allowed, maxAllowed, remaining, retryAfterSeconds);
    }

    private static class WindowCounter {
        final long minute;
        final AtomicInteger count;

        WindowCounter(long minute, int initialCount) {
            this.minute = minute;
            this.count = new AtomicInteger(initialCount);
        }
    }

    public record RateLimitResult(
            boolean isAllowed,
            int limit,
            int remaining,
            long retryAfterSeconds
    ) {}
}
