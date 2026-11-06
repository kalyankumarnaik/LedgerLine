package com.ledgerline.repository;

import com.ledgerline.domain.AccountPermission;
import com.ledgerline.domain.enums.PermissionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountPermissionRepository extends JpaRepository<AccountPermission, UUID> {
    List<AccountPermission> findAllByUserId(UUID userId);
    List<AccountPermission> findAllByAccountId(UUID accountId);
    Optional<AccountPermission> findByAccountIdAndUserId(UUID accountId, UUID userId);
    boolean existsByAccountIdAndUserIdAndPermissionType(UUID accountId, UUID userId, PermissionType permissionType);
    boolean existsByAccountIdAndUserId(UUID accountId, UUID userId);
}
