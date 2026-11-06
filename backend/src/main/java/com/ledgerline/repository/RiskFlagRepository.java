package com.ledgerline.repository;

import com.ledgerline.domain.RiskFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RiskFlagRepository extends JpaRepository<RiskFlag, UUID> {
    List<RiskFlag> findAllByOrderByCreatedAtDesc();
    List<RiskFlag> findAllByResolvedFalseOrderByCreatedAtDesc();
}
