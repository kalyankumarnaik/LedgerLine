package com.ledgerline.service;

import com.ledgerline.domain.AuditEvent;
import com.ledgerline.domain.FailedTransactionAttempt;
import com.ledgerline.domain.User;
import com.ledgerline.dto.response.FailedAttemptDto;
import com.ledgerline.repository.AuditEventRepository;
import com.ledgerline.repository.FailedTransactionAttemptRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);
    private final AuditEventRepository auditEventRepository;
    private final FailedTransactionAttemptRepository failedAttemptRepository;

    public AuditService(AuditEventRepository auditEventRepository,
                        FailedTransactionAttemptRepository failedAttemptRepository) {
        this.auditEventRepository = auditEventRepository;
        this.failedAttemptRepository = failedAttemptRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAuditEvent(User user, String action, String resourceType, String resourceId, String details, String ipAddress) {
        try {
            AuditEvent event = new AuditEvent(user, action, resourceType, resourceId, details, ipAddress);
            auditEventRepository.save(event);
        } catch (Exception e) {
            log.error("Failed to persist audit event [action={}, resource={}]", action, resourceType, e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailedAttempt(String correlationId, User user, UUID accountId,
                                    String requestedOperation, BigDecimal amount,
                                    String idempotencyKey, String failureReason) {
        try {
            FailedTransactionAttempt attempt = new FailedTransactionAttempt(
                    correlationId,
                    user,
                    accountId,
                    requestedOperation,
                    amount,
                    idempotencyKey,
                    failureReason
            );
            failedAttemptRepository.save(attempt);
            log.info("Recorded failed financial attempt [corr={}, op={}, reason={}]", correlationId, requestedOperation, failureReason);
        } catch (Exception e) {
            log.error("Failed to record failed transaction attempt [corr={}]", correlationId, e);
        }
    }

    @Transactional(readOnly = true)
    public List<FailedAttemptDto> getFailedAttempts() {
        return failedAttemptRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(f -> new FailedAttemptDto(
                        f.getId(),
                        f.getCorrelationId(),
                        f.getInitiatingUser() != null ? f.getInitiatingUser().getUsername() : "ANONYMOUS",
                        f.getAccountId(),
                        f.getRequestedOperation(),
                        f.getAmount(),
                        f.getIdempotencyKey(),
                        f.getFailureReason(),
                        f.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditEvent> getAuditEvents() {
        return auditEventRepository.findAllByOrderByCreatedAtDesc();
    }
}
