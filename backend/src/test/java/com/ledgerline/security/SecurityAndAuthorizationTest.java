package com.ledgerline.security;

import com.ledgerline.domain.Account;
import com.ledgerline.domain.User;
import com.ledgerline.dto.request.WithdrawRequest;
import com.ledgerline.exception.UnauthorizedAccountAccessException;
import com.ledgerline.repository.AccountRepository;
import com.ledgerline.repository.UserRepository;
import com.ledgerline.service.AccountService;
import com.ledgerline.service.FinancialEngineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
public class SecurityAndAuthorizationTest {

    @Autowired
    private FinancialEngineService financialEngineService;

    @Autowired
    private AccountService accountService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    private User alex;
    private User elena;
    private Account elenaAccount;

    @BeforeEach
    void setUp() {
        alex = userRepository.findByUsername("alex").orElseThrow();
        elena = userRepository.findByUsername("elena").orElseThrow();
        elenaAccount = accountRepository.findByAccountNumber("LL-CHK-88991201").orElseThrow();
    }

    @Test
    @DisplayName("Authorization Test: User cannot withdraw from an account they do not own or have permission for")
    void testWithdrawUnauthorizedAccountForbidden() {
        WithdrawRequest request = new WithdrawRequest(
                elenaAccount.getId(),
                new BigDecimal("500.0000"),
                "Unauthorized withdrawal attempt",
                UUID.randomUUID().toString()
        );

        assertThrows(UnauthorizedAccountAccessException.class, () -> {
            financialEngineService.executeWithdraw(request, alex);
        }, "Server must reject withdrawal attempts against accounts belonging to other users");
    }

    @Test
    @DisplayName("Authorization Test: Account holder cannot view another user's private account")
    void testViewUnauthorizedAccountForbidden() {
        assertThrows(UnauthorizedAccountAccessException.class, () -> {
            accountService.getAccountById(elenaAccount.getId(), alex, false);
        }, "Account holder should not be able to query unauthorized accounts");
    }
}
