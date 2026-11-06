package com.ledgerline.repository;

import com.ledgerline.domain.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, UUID> {
    Optional<JournalEntry> findByEntryReference(String entryReference);
    Optional<JournalEntry> findByTransactionId(UUID transactionId);
    List<JournalEntry> findAllByOrderByPostedAtDesc();
}
