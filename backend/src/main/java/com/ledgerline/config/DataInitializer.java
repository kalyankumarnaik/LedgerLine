package com.ledgerline.config;

import com.ledgerline.domain.*;
import com.ledgerline.domain.enums.*;
import com.ledgerline.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AccountRepository accountRepository;
    private final AccountBalanceRepository accountBalanceRepository;
    private final AccountPermissionRepository accountPermissionRepository;
    private final TransactionLimitRepository transactionLimitRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           RoleRepository roleRepository,
                           AccountRepository accountRepository,
                           AccountBalanceRepository accountBalanceRepository,
                           AccountPermissionRepository accountPermissionRepository,
                           TransactionLimitRepository transactionLimitRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.accountRepository = accountRepository;
        this.accountBalanceRepository = accountBalanceRepository;
        this.accountPermissionRepository = accountPermissionRepository;
        this.transactionLimitRepository = transactionLimitRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Verifying LedgerLine security and seed records...");

        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_ADMIN)));
        Role holderRole = roleRepository.findByName(RoleName.ROLE_ACCOUNT_HOLDER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_ACCOUNT_HOLDER)));
        Role auditorRole = roleRepository.findByName(RoleName.ROLE_AUDITOR)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_AUDITOR)));

        // Ensure Admin user
        User admin = userRepository.findByUsername("admin").orElseGet(() -> {
            User u = new User("admin", "admin@ledgerline.com", passwordEncoder.encode("Password@123!"), "System Administrator");
            u.getRoles().add(adminRole);
            return userRepository.save(u);
        });
        if (!passwordEncoder.matches("Password@123!", admin.getPasswordHash())) {
            admin.setPasswordHash(passwordEncoder.encode("Password@123!"));
            userRepository.save(admin);
        }

        // Ensure Account Holder user
        User alex = userRepository.findByUsername("alex").orElseGet(() -> {
            User u = new User("alex", "alex.holder@ledgerline.com", passwordEncoder.encode("Password@123!"), "Alex Morgan (Account Holder)");
            u.getRoles().add(holderRole);
            return userRepository.save(u);
        });
        if (!passwordEncoder.matches("Password@123!", alex.getPasswordHash())) {
            alex.setPasswordHash(passwordEncoder.encode("Password@123!"));
            userRepository.save(alex);
        }

        // Ensure Elena user
        User elena = userRepository.findByUsername("elena").orElseGet(() -> {
            User u = new User("elena", "elena.partner@ledgerline.com", passwordEncoder.encode("Password@123!"), "Elena Vance (Corporate Holder)");
            u.getRoles().add(holderRole);
            return userRepository.save(u);
        });
        if (!passwordEncoder.matches("Password@123!", elena.getPasswordHash())) {
            elena.setPasswordHash(passwordEncoder.encode("Password@123!"));
            userRepository.save(elena);
        }

        // Ensure Auditor user
        User sarah = userRepository.findByUsername("sarah").orElseGet(() -> {
            User u = new User("sarah", "sarah.auditor@ledgerline.com", passwordEncoder.encode("Password@123!"), "Sarah Jenkins (Auditor)");
            u.getRoles().add(auditorRole);
            return userRepository.save(u);
        });
        if (!passwordEncoder.matches("Password@123!", sarah.getPasswordHash())) {
            sarah.setPasswordHash(passwordEncoder.encode("Password@123!"));
            userRepository.save(sarah);
        }

        // Ensure System Clearing Account
        if (accountRepository.findByAccountNumber("SYS-CLEARING-INR-001").isEmpty()) {
            Account clearing = new Account("SYS-CLEARING-INR-001", admin, "Reserve Clearing Account", AccountType.SYSTEM_CLEARING, "INR");
            clearing = accountRepository.save(clearing);
            AccountBalance balance = new AccountBalance(clearing, new BigDecimal("10000000.0000"));
            accountBalanceRepository.save(balance);
        }

        // Ensure Alex Primary Checking Account
        if (accountRepository.findByAccountNumber("LL-CHK-10020491").isEmpty()) {
            Account alexChecking = new Account("LL-CHK-10020491", alex, "Alex Primary Checking", AccountType.CHECKING, "INR");
            alexChecking = accountRepository.save(alexChecking);
            AccountBalance balance = new AccountBalance(alexChecking, new BigDecimal("50000.0000"));
            accountBalanceRepository.save(balance);
            accountPermissionRepository.save(new AccountPermission(alexChecking, alex, PermissionType.OWNER));
            transactionLimitRepository.save(new TransactionLimit(alexChecking, new BigDecimal("200000.0000"), new BigDecimal("50000.0000")));
        }

        log.info("LedgerLine seed and demonstration records ready.");
    }
}
