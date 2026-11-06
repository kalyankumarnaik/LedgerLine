package com.ledgerline.service;

import com.ledgerline.domain.*;
import com.ledgerline.domain.enums.AccountType;
import com.ledgerline.domain.enums.PermissionType;
import com.ledgerline.domain.enums.RoleName;
import com.ledgerline.dto.request.LoginRequest;
import com.ledgerline.dto.request.RefreshTokenRequest;
import com.ledgerline.dto.request.RegisterRequest;
import com.ledgerline.dto.response.AuthResponse;
import com.ledgerline.dto.response.UserDto;
import com.ledgerline.exception.LedgerLineException;
import com.ledgerline.exception.ResourceNotFoundException;
import com.ledgerline.repository.*;
import com.ledgerline.security.JwtTokenProvider;
import com.ledgerline.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AccountRepository accountRepository;
    private final AccountBalanceRepository accountBalanceRepository;
    private final AccountPermissionRepository accountPermissionRepository;
    private final TransactionLimitRepository transactionLimitRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    @Value("${ledgerline.security.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${ledgerline.security.lockout-duration-minutes:15}")
    private int lockoutDurationMinutes;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       AccountRepository accountRepository,
                       AccountBalanceRepository accountBalanceRepository,
                       AccountPermissionRepository accountPermissionRepository,
                       TransactionLimitRepository transactionLimitRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.accountRepository = accountRepository;
        this.accountBalanceRepository = accountBalanceRepository;
        this.accountPermissionRepository = accountPermissionRepository;
        this.transactionLimitRepository = transactionLimitRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new LedgerLineException("Username is already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new LedgerLineException("Email is already registered: " + request.getEmail());
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName()
        );

        Role defaultRole = roleRepository.findByName(RoleName.ROLE_ACCOUNT_HOLDER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_ACCOUNT_HOLDER)));
        user.getRoles().add(defaultRole);

        user = userRepository.save(user);

        // Provision default Primary Checking account for the user
        String accountNumber = "LL-CHK-" + (10000000 + (long)(Math.random() * 90000000));
        Account account = new Account(accountNumber, user, user.getFullName() + " Checking", AccountType.CHECKING, "INR");
        account = accountRepository.save(account);

        AccountBalance balance = new AccountBalance(account, BigDecimal.ZERO);
        accountBalanceRepository.save(balance);

        AccountPermission permission = new AccountPermission(account, user, PermissionType.OWNER);
        accountPermissionRepository.save(permission);

        TransactionLimit limit = new TransactionLimit(account, new BigDecimal("100000.0000"), new BigDecimal("50000.0000"));
        transactionLimitRepository.save(limit);

        auditService.recordAuditEvent(user, "USER_REGISTER", "USER", user.getId().toString(),
                "Registered new user " + user.getUsername() + " and provisioned account " + accountNumber, null);

        UserPrincipal principal = UserPrincipal.create(user);
        String token = tokenProvider.generateAccessToken(principal);
        String refreshToken = generateAndSaveRefreshToken(user);

        return new AuthResponse(token, refreshToken, mapUserToDto(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password."));

        if (!user.isAccountNonLocked()) {
            throw new LedgerLineException("Account is temporarily locked due to repeated failed login attempts. Please try again after " + user.getLockedUntil());
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Reset failed login counter on success
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            String token = tokenProvider.generateAccessToken(principal);
            String refreshToken = generateAndSaveRefreshToken(user);

            auditService.recordAuditEvent(user, "USER_LOGIN_SUCCESS", "USER", user.getId().toString(),
                    "User logged in successfully", null);

            return new AuthResponse(token, refreshToken, mapUserToDto(user));

        } catch (BadCredentialsException ex) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= maxFailedAttempts) {
                user.setLockedUntil(Instant.now().plus(lockoutDurationMinutes, ChronoUnit.MINUTES));
                log.warn("User {} locked out due to {} failed login attempts.", user.getUsername(), attempts);
            }
            userRepository.save(user);
            auditService.recordAuditEvent(user, "USER_LOGIN_FAILED", "USER", user.getId().toString(),
                    "Failed login attempt (" + attempts + "/" + maxFailedAttempts + ")", null);
            throw new BadCredentialsException("Invalid username or password.");
        }
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String tokenHash = hashToken(request.getRefreshToken());
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new LedgerLineException("Invalid or unrecognized refresh token."));

        if (storedToken.isRevoked() || storedToken.isExpired()) {
            throw new LedgerLineException("Refresh token is expired or revoked. Please log in again.");
        }

        User user = storedToken.getUser();
        // Revoke the old refresh token (Token Rotation pattern)
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        UserPrincipal principal = UserPrincipal.create(user);
        String newAccessToken = tokenProvider.generateAccessToken(principal);
        String newRefreshToken = generateAndSaveRefreshToken(user);

        return new AuthResponse(newAccessToken, newRefreshToken, mapUserToDto(user));
    }

    @Transactional
    public void logout(User user) {
        if (user != null) {
            refreshTokenRepository.deleteByUserId(user.getId());
            auditService.recordAuditEvent(user, "USER_LOGOUT", "USER", user.getId().toString(), "User logged out", null);
        }
    }

    private String generateAndSaveRefreshToken(User user) {
        String rawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String tokenHash = hashToken(rawToken);
        Instant expiresAt = Instant.now().plus(7, ChronoUnit.DAYS);

        RefreshToken refreshToken = new RefreshToken(user, tokenHash, expiresAt);
        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }

    public UserDto mapUserToDto(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet());
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.isEnabled(),
                roles,
                user.getCreatedAt()
        );
    }
}
