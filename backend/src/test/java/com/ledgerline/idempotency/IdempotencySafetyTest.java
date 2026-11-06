package com.ledgerline.idempotency;

import com.ledgerline.domain.Account;
import com.ledgerline.domain.AccountBalance;
import com.ledgerline.domain.User;
import com.ledgerline.dto.request.DepositRequest;
import com.ledgerline.dto.response.TransactionDto;
import com.ledgerline.exception.IdempotencyConflictException;
import com.ledgerline.repository.AccountBalanceRepository;
import com.ledgerline.repository.AccountRepository;
import com.ledgerline.repository.UserRepository;
import com.ledgerline.service.FinancialEngineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class IdempotencySafetyTest {

    @Autowired
    private FinancialEngineService financialEngineService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AccountBalanceRepository accountBalanceRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private Account testAccount;

    @BeforeEach
    void setUp() {
        testUser = userRepository.findByUsername("alex").orElseThrow();
        testAccount = accountRepository.findByAccountNumber("LL-CHK-10020491").orElseThrow();
    }

    @Test
    @DisplayName("Idempotency Test: Same request submitted twice returns original result and does NOT double-credit")
    void testReplayPreventionWithSameKeyAndPayload() {
        String idempotencyKey = "TEST-IDEMP-" + UUID.randomUUID();
        BigDecimal depositAmount = new BigDecimal("1000.0000");

        AccountBalance balBefore = accountBalanceRepository.findByAccountId(testAccount.getId()).orElseThrow();
        BigDecimal startBalance = balBefore.getBalance();

        DepositRequest request1 = new DepositRequest(testAccount.getId(), depositAmount, "Idempotent funding", idempotencyKey);
        TransactionDto response1 = financialEngineService.executeDeposit(request1, testUser);
        assertNotNull(response1);

        AccountBalance balAfterFirst = accountBalanceRepository.findByAccountId(testAccount.getId()).orElseThrow();
        assertEquals(startBalance.add(depositAmount), balAfterFirst.getBalance());

        // Re-submit the exact same request with the same idempotency key
        DepositRequest request2 = new DepositRequest(testAccount.getId(), depositAmount, "Idempotent funding", idempotencyKey);
        TransactionDto response2 = financialEngineService.executeDeposit(request2, testUser);
        assertNotNull(response2);

        // Verification: Returned transaction reference matches original transaction
        assertEquals(response1.getTransactionReference(), response2.getTransactionReference());

        // Verification: Account balance did NOT increase again!
        AccountBalance balAfterSecond = accountBalanceRepository.findByAccountId(testAccount.getId()).orElseThrow();
        assertEquals(balAfterFirst.getBalance(), balAfterSecond.getBalance(), "Balance must not change on duplicate idempotency key submission");
    }

    @Test
    @DisplayName("Idempotency Test: Same key with mutated payload throws IdempotencyConflictException")
    void testConflictWhenKeyReusedWithDifferentPayload() {
        String idempotencyKey = "TEST-CONFLICT-" + UUID.randomUUID();

        DepositRequest request1 = new DepositRequest(testAccount.getId(), new BigDecimal("500.0000"), "First call", idempotencyKey);
        financialEngineService.executeDeposit(request1, testUser);

        // Submit altered amount with the same idempotency key
        DepositRequest mutatedRequest = new DepositRequest(testAccount.getId(), new BigDecimal("999.0000"), "Altered payload", idempotencyKey);

        assertThrows(IdempotencyConflictException.class, () -> {
            financialEngineService.executeDeposit(mutatedRequest, testUser);
        }, "Reusing an idempotency key with a different payload must throw IdempotencyConflictException");
    }
}
