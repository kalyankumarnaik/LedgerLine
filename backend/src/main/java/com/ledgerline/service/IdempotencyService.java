package com.ledgerline.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ledgerline.domain.IdempotencyRecord;
import com.ledgerline.domain.User;
import com.ledgerline.domain.enums.IdempotencyStatus;
import com.ledgerline.exception.IdempotencyConflictException;
import com.ledgerline.exception.IdempotencyProcessingException;
import com.ledgerline.repository.IdempotencyRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class IdempotencyService {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyService.class);
    private final IdempotencyRecordRepository idempotencyRepository;
    private final ObjectMapper objectMapper;

    public IdempotencyService(IdempotencyRecordRepository idempotencyRepository, ObjectMapper objectMapper) {
        this.idempotencyRepository = idempotencyRepository;
        this.objectMapper = objectMapper;
    }

    public String computePayloadHash(Object payload) {
        if (payload == null) return "EMPTY_PAYLOAD";
        try {
            String json = objectMapper.writeValueAsString(payload);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(json.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute payload hash", e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public <T> Optional<T> checkAndLockKey(String idempotencyKey, User user, String operationType, Object payload, Class<T> responseType) {
        if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) {
            return Optional.empty();
        }

        String requestHash = computePayloadHash(payload);
        Optional<IdempotencyRecord> existingOpt = idempotencyRepository.findByUserIdAndKeyWithLock(user.getId(), idempotencyKey);

        if (existingOpt.isPresent()) {
            IdempotencyRecord existing = existingOpt.get();

            // Replay detection: ensure payload has not been mutated
            if (!existing.getRequestHash().equals(requestHash)) {
                log.warn("Idempotency conflict for user {} key {}: payload hash mismatch", user.getUsername(), idempotencyKey);
                throw new IdempotencyConflictException("Idempotency key '" + idempotencyKey + "' was already used with a different request payload.");
            }

            if (existing.getStatus() == IdempotencyStatus.PROCESSING) {
                log.warn("Concurrent duplicate request in progress for user {} key {}", user.getUsername(), idempotencyKey);
                throw new IdempotencyProcessingException("A transaction with idempotency key '" + idempotencyKey + "' is currently being processed.");
            }

            if (existing.getStatus() == IdempotencyStatus.COMPLETED && existing.getResponsePayload() != null) {
                log.info("Idempotent replay detected for user {} key {}. Returning cached result.", user.getUsername(), idempotencyKey);
                try {
                    return Optional.of(objectMapper.readValue(existing.getResponsePayload(), responseType));
                } catch (Exception e) {
                    log.error("Failed to deserialize cached idempotency response", e);
                }
            }
        } else {
            // Register new idempotency key with 24-hour expiration
            Instant expiresAt = Instant.now().plus(24, ChronoUnit.HOURS);
            IdempotencyRecord newRecord = new IdempotencyRecord(idempotencyKey, user, operationType, requestHash, expiresAt);
            idempotencyRepository.save(newRecord);
        }

        return Optional.empty();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordSuccess(String idempotencyKey, User user, Object response) {
        if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) return;

        idempotencyRepository.findByUserIdAndKeyWithLock(user.getId(), idempotencyKey).ifPresent(record -> {
            try {
                record.setStatus(IdempotencyStatus.COMPLETED);
                record.setResponsePayload(objectMapper.writeValueAsString(response));
                idempotencyRepository.save(record);
            } catch (Exception e) {
                log.error("Failed to serialize response for idempotency persistence", e);
            }
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailure(String idempotencyKey, User user, String reason) {
        if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) return;

        idempotencyRepository.findByUserIdAndKeyWithLock(user.getId(), idempotencyKey).ifPresent(record -> {
            record.setStatus(IdempotencyStatus.FAILED);
            record.setResponsePayload("{\"error\":\"" + reason + "\"}");
            idempotencyRepository.save(record);
        });
    }
}
