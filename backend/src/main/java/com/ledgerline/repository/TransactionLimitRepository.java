package com.ledgerline.repository;

import com.ledgerline.domain.TransactionLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionLimitRepository extends JpaRepository<TransactionLimit, UUID> {
    Optional<TransactionLimit> findByAccountId(UUID accountId);
}
