package com.ledgerline.service;

import com.ledgerline.domain.Account;
import com.ledgerline.domain.FinancialTransaction;
import com.ledgerline.domain.RiskFlag;
import com.ledgerline.domain.enums.RiskSeverity;
import com.ledgerline.dto.response.RiskFlagDto;
import com.ledgerline.repository.FailedTransactionAttemptRepository;
import com.ledgerline.repository.FinancialTransactionRepository;
import com.ledgerline.repository.RiskFlagRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RiskReviewEngine {

    private static final Logger log = LoggerFactory.getLogger(RiskReviewEngine.class);

    private final RiskFlagRepository riskFlagRepository;
    private final FinancialTransactionRepository transactionRepository;
    private final FailedTransactionAttemptRepository failedAttemptRepository;

    private static final BigDecimal LARGE_TRANSACTION_THRESHOLD = new BigDecimal("100000.0000");

    public RiskReviewEngine(RiskFlagRepository riskFlagRepository,
                            FinancialTransactionRepository transactionRepository,
                            FailedTransactionAttemptRepository failedAttemptRepository) {
        this.riskFlagRepository = riskFlagRepository;
        this.transactionRepository = transactionRepository;
        this.failedAttemptRepository = failedAttemptRepository;
    }

    @Transactional
    public void evaluateTransaction(FinancialTransaction tx) {
        try {
            // Rule 1: High-Value Transfer Spike
            if (tx.getAmount().compareTo(LARGE_TRANSACTION_THRESHOLD) >= 0) {
                RiskFlag flag = new RiskFlag(
                        tx,
                        tx.getSourceAccount(),
                        RiskSeverity.HIGH,
                        "HIGH_VALUE_THRESHOLD",
                        "Transaction amount of ₹" + tx.getAmount() + " meets or exceeds standard risk threshold ₹" + LARGE_TRANSACTION_THRESHOLD
                );
                riskFlagRepository.save(flag);
                log.info("Risk flag raised: HIGH_VALUE_THRESHOLD on tx {}", tx.getTransactionReference());
            }

            // Rule 2: Rapid Transaction Velocity (more than 4 outgoing transfers in 5 minutes)
            if (tx.getSourceAccount() != null) {
                Instant fiveMinutesAgo = Instant.now().minus(5, ChronoUnit.MINUTES);
                long recentTxCount = transactionRepository.countOutgoingTransactionsSince(tx.getSourceAccount().getId(), fiveMinutesAgo);
                if (recentTxCount >= 4) {
                    RiskFlag flag = new RiskFlag(
                            tx,
                            tx.getSourceAccount(),
                            RiskSeverity.MEDIUM,
                            "RAPID_TRANSACTION_BURST",
                            "Account executed " + recentTxCount + " transactions within 5 minutes, indicating rapid velocity."
                    );
                    riskFlagRepository.save(flag);
                    log.info("Risk flag raised: RAPID_TRANSACTION_BURST on account {}", tx.getSourceAccount().getAccountNumber());
                }
            }
        } catch (Exception e) {
            log.error("Error evaluating risk for transaction {}", tx.getId(), e);
        }
    }

    @Transactional
    public void evaluateRepeatedFailures(UUID userId, UUID accountId) {
        try {
            Instant fifteenMinutesAgo = Instant.now().minus(15, ChronoUnit.MINUTES);
            long failureCount = failedAttemptRepository.countFailedAttemptsByUserSince(userId, fifteenMinutesAgo);
            if (failureCount >= 3) {
                RiskFlag flag = new RiskFlag(
                        null,
                        null,
                        RiskSeverity.HIGH,
                        "REPEATED_FAILED_ATTEMPTS",
                        "User generated " + failureCount + " failed financial attempts within 15 minutes."
                );
                riskFlagRepository.save(flag);
                log.warn("Risk flag raised: REPEATED_FAILED_ATTEMPTS for user {}", userId);
            }
        } catch (Exception e) {
            log.error("Error evaluating failure risk for user {}", userId, e);
        }
    }

    @Transactional(readOnly = true)
    public List<RiskFlagDto> getAllFlags() {
        return riskFlagRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(f -> new RiskFlagDto(
                        f.getId(),
                        f.getTransaction() != null ? f.getTransaction().getId() : null,
                        f.getAccount() != null ? f.getAccount().getId() : null,
                        f.getSeverity(),
                        f.getRuleName(),
                        f.getDescription(),
                        f.isResolved(),
                        f.getResolvedBy() != null ? f.getResolvedBy().getUsername() : null,
                        f.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void resolveFlag(UUID flagId, com.ledgerline.domain.User admin) {
        riskFlagRepository.findById(flagId).ifPresent(f -> {
            f.setResolved(true);
            f.setResolvedBy(admin);
            riskFlagRepository.save(f);
        });
    }
}
