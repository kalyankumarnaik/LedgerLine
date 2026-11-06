package com.ledgerline.repository;

import com.ledgerline.domain.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {
    List<LedgerEntry> findAllByAccountIdOrderByCreatedAtAsc(UUID accountId);
    List<LedgerEntry> findAllByAccountIdOrderByCreatedAtDesc(UUID accountId);
    List<LedgerEntry> findAllByJournalEntryId(UUID journalEntryId);

    @Query("SELECT l FROM LedgerEntry l WHERE l.account.id = :accountId ORDER BY l.createdAt DESC, l.id DESC LIMIT 1")
    Optional<LedgerEntry> findLatestByAccountId(@Param("accountId") UUID accountId);

    @Query("SELECT COALESCE(SUM(CASE WHEN l.entryType = com.ledgerline.domain.enums.EntryType.CREDIT THEN l.amount ELSE -l.amount END), 0) " +
           "FROM LedgerEntry l WHERE l.account.id = :accountId")
    BigDecimal calculateReconciledBalance(@Param("accountId") UUID accountId);
}
