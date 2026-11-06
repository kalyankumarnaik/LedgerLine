package com.ledgerline.repository;

import com.ledgerline.domain.FinancialTransaction;
import com.ledgerline.domain.enums.TransactionStatus;
import com.ledgerline.domain.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, UUID> {
    Optional<FinancialTransaction> findByTransactionReference(String transactionReference);

    List<FinancialTransaction> findAllByOrderByCreatedAtDesc();

    @Query("SELECT t FROM FinancialTransaction t WHERE t.sourceAccount.id = :accountId OR t.destinationAccount.id = :accountId ORDER BY t.createdAt DESC")
    List<FinancialTransaction> findAllByAccountIdOrderByCreatedAtDesc(@Param("accountId") UUID accountId);

    @Query("SELECT t FROM FinancialTransaction t WHERE t.sourceAccount.id = :accountId OR t.destinationAccount.id = :accountId")
    Page<FinancialTransaction> findPagedByAccountId(@Param("accountId") UUID accountId, Pageable pageable);

    @Query("SELECT t FROM FinancialTransaction t WHERE (t.sourceAccount.id = :accountId OR t.destinationAccount.id = :accountId) AND t.createdAt >= :since")
    List<FinancialTransaction> findByAccountIdAndCreatedAtAfter(@Param("accountId") UUID accountId, @Param("since") Instant since);

    long countByStatus(TransactionStatus status);

    @Query("SELECT COUNT(t) FROM FinancialTransaction t WHERE t.sourceAccount.id = :accountId AND t.createdAt >= :since AND t.status = 'POSTED'")
    long countOutgoingTransactionsSince(@Param("accountId") UUID accountId, @Param("since") Instant since);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM FinancialTransaction t WHERE t.sourceAccount.id = :accountId AND t.createdAt >= :since AND t.status = 'POSTED'")
    BigDecimal sumOutgoingAmountSince(@Param("accountId") UUID accountId, @Param("since") Instant since);
}
