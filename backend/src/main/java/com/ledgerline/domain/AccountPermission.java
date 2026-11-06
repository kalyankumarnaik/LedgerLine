package com.ledgerline.domain;

import com.ledgerline.domain.enums.PermissionType;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "account_permissions", uniqueConstraints = {
    @UniqueConstraint(name = "uk_account_user_perm", columnNames = {"account_id", "user_id", "permission_type"})
})
public class AccountPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "permission_type", nullable = false, length = 32)
    private PermissionType permissionType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public AccountPermission() {}

    public AccountPermission(Account account, User user, PermissionType permissionType) {
        this.account = account;
        this.user = user;
        this.permissionType = permissionType;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public PermissionType getPermissionType() { return permissionType; }
    public void setPermissionType(PermissionType permissionType) { this.permissionType = permissionType; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
