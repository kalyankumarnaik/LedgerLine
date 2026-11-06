package com.ledgerline.repository;

import com.ledgerline.domain.FailedTransactionAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface FailedTransactionAttemptRepository extends JpaRepository<FailedTransactionAttempt, UUID> {
    List<FailedTransactionAttempt> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(f) FROM FailedTransactionAttempt f WHERE f.initiatingUser.id = :userId AND f.createdAt >= :since")
    long countFailedAttemptsByUserSince(@Param("userId") UUID userId, @Param("since") Instant since);

    @Query("SELECT COUNT(f) FROM FailedTransactionAttempt f WHERE f.accountId = :accountId AND f.createdAt >= :since")
    long countFailedAttemptsByAccountSince(@Param("accountId") UUID accountId, @Param("since") Instant since);
}
