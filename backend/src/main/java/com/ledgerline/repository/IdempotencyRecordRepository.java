package com.ledgerline.repository;

import com.ledgerline.domain.IdempotencyRecord;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IdempotencyRecordRepository extends JpaRepository<IdempotencyRecord, UUID> {
    Optional<IdempotencyRecord> findByUserIdAndIdempotencyKey(UUID userId, String idempotencyKey);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM IdempotencyRecord r WHERE r.user.id = :userId AND r.idempotencyKey = :key")
    Optional<IdempotencyRecord> findByUserIdAndKeyWithLock(@Param("userId") UUID userId, @Param("key") String key);

    void deleteAllByExpiresAtBefore(Instant now);
}
