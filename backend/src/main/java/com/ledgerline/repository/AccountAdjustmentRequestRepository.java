package com.ledgerline.repository;

import com.ledgerline.domain.AccountAdjustmentRequest;
import com.ledgerline.domain.enums.AdjustmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountAdjustmentRequestRepository extends JpaRepository<AccountAdjustmentRequest, UUID> {
    List<AccountAdjustmentRequest> findAllByOrderByCreatedAtDesc();
    List<AccountAdjustmentRequest> findAllByStatusOrderByCreatedAtDesc(AdjustmentStatus status);
}
