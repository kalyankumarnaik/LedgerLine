package com.ledgerline.concurrency;

import com.ledgerline.domain.Account;
import com.ledgerline.domain.AccountBalance;
import com.ledgerline.domain.AccountPermission;
import com.ledgerline.domain.TransactionLimit;
import com.ledgerline.domain.User;
import com.ledgerline.domain.enums.AccountType;
import com.ledgerline.domain.enums.PermissionType;
import com.ledgerline.dto.request.TransferRequest;
import com.ledgerline.dto.request.WithdrawRequest;
import com.ledgerline.dto.response.TransactionDto;
import com.ledgerline.exception.InsufficientFundsException;
import com.ledgerline.repository.*;
import com.ledgerline.service.FinancialEngineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class ConcurrencyAndRaceConditionTest {

    @Autowired
    private FinancialEngineService financialEngineService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AccountBalanceRepository accountBalanceRepository;

    @Autowired
    private AccountPermissionRepository accountPermissionRepository;

    @Autowired
    private TransactionLimitRepository transactionLimitRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private User secondUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.findByUsername("alex").orElseThrow();
        secondUser = userRepository.findByUsername("elena").orElseThrow();
    }

    @Test
    @DisplayName("Concurrency Test: Two simultaneous withdrawals of ₹800 against ₹1,000 balance - exactly 1 succeeds, balance becomes ₹200, never negative!")
    void testSimultaneousWithdrawalsExceedingBalance() throws InterruptedException {
        // Setup dedicated test account with exactly ₹1,000 balance
        String accNum = "LL-RACE-" + System.currentTimeMillis();
        Account raceAccount = new Account(accNum, testUser, "Race Test Account", AccountType.CHECKING, "INR");
        raceAccount = accountRepository.save(raceAccount);

        AccountBalance initialBalance = new AccountBalance(raceAccount, new BigDecimal("1000.0000"));
        accountBalanceRepository.save(initialBalance);

        accountPermissionRepository.save(new AccountPermission(raceAccount, testUser, PermissionType.OWNER));
        transactionLimitRepository.save(new TransactionLimit(raceAccount, new BigDecimal("50000.0000"), new BigDecimal("50000.0000")));

        final UUID accountId = raceAccount.getId();
        final BigDecimal withdrawAmount = new BigDecimal("800.0000");

        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final String idempotencyKey = "IDEMP-WITHDRAW-RACE-" + i + "-" + UUID.randomUUID();
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await(); // wait for simultaneous fire
                    WithdrawRequest req = new WithdrawRequest(accountId, withdrawAmount, "Race withdrawal", idempotencyKey);
                    TransactionDto dto = financialEngineService.executeWithdraw(req, testUser);
                    if (dto != null) {
                        successCount.incrementAndGet();
                    }
                } catch (InsufficientFundsException e) {
                    failureCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                }
            });
        }

        readyLatch.await(5, TimeUnit.SECONDS);
        startLatch.countDown(); // Fire both threads simultaneously!

        executor.shutdown();
        boolean finished = executor.awaitTermination(10, TimeUnit.SECONDS);
        assertTrue(finished, "Executor threads should complete within timeout");

        // CRITICAL FINTECH INVARIANTS:
        // 1. Exactly one request must succeed (₹800 <= ₹1000)
        assertEquals(1, successCount.get(), "Exactly one withdrawal of ₹800 must succeed against ₹1,000 balance");

        // 2. Exactly one request must fail (remaining ₹200 < ₹800)
        assertEquals(1, failureCount.get(), "The second simultaneous withdrawal must be refused");

        // 3. Balance must be exactly ₹200.0000 and NEVER negative
        AccountBalance finalBalance = accountBalanceRepository.findByAccountId(accountId).orElseThrow();
        assertEquals(new BigDecimal("200.0000"), finalBalance.getBalance(), "Final balance must be exactly ₹200.0000");
        assertTrue(finalBalance.getBalance().compareTo(BigDecimal.ZERO) >= 0, "Account balance must NEVER become negative");
    }

    @Test
    @DisplayName("Concurrency Test: Transfers in opposite directions (A->B and B->A) executed concurrently without deadlock")
    void testConcurrentOppositeTransfersDeadlockPrevention() throws InterruptedException {
        // Account A: ₹5,000
        Account accA = new Account("LL-DEADLOCK-A-" + System.currentTimeMillis(), testUser, "Acc A", AccountType.CHECKING, "INR");
        accA = accountRepository.save(accA);
        accountBalanceRepository.save(new AccountBalance(accA, new BigDecimal("5000.0000")));
        accountPermissionRepository.save(new AccountPermission(accA, testUser, PermissionType.OWNER));
        transactionLimitRepository.save(new TransactionLimit(accA, new BigDecimal("50000.0000"), new BigDecimal("50000.0000")));

        // Account B: ₹5,000
        Account accB = new Account("LL-DEADLOCK-B-" + System.currentTimeMillis(), secondUser, "Acc B", AccountType.CHECKING, "INR");
        accB = accountRepository.save(accB);
        accountBalanceRepository.save(new AccountBalance(accB, new BigDecimal("5000.0000")));
        accountPermissionRepository.save(new AccountPermission(accB, secondUser, PermissionType.OWNER));
        transactionLimitRepository.save(new TransactionLimit(accB, new BigDecimal("50000.0000"), new BigDecimal("50000.0000")));

        final UUID idA = accA.getId();
        final String numA = accA.getAccountNumber();
        final UUID idB = accB.getId();
        final String numB = accB.getAccountNumber();

        int threadCount = 4;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);

        AtomicInteger completedCount = new AtomicInteger(0);

        // 2 threads transfer A -> B (₹500 each)
        for (int i = 0; i < 2; i++) {
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    TransferRequest req = new TransferRequest(idA, numB, new BigDecimal("500.0000"), "A to B", UUID.randomUUID().toString());
                    financialEngineService.executeTransfer(req, testUser);
                    completedCount.incrementAndGet();
                } catch (Exception ignored) {}
            });
        }

        // 2 threads transfer B -> A (₹300 each)
        for (int i = 0; i < 2; i++) {
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    TransferRequest req = new TransferRequest(idB, numA, new BigDecimal("300.0000"), "B to A", UUID.randomUUID().toString());
                    financialEngineService.executeTransfer(req, secondUser);
                    completedCount.incrementAndGet();
                } catch (Exception ignored) {}
            });
        }

        readyLatch.await(5, TimeUnit.SECONDS);
        startLatch.countDown(); // Fire all 4 cross-transfers concurrently!

        executor.shutdown();
        boolean completedNoDeadlock = executor.awaitTermination(15, TimeUnit.SECONDS);

        // Invariant: No deadlock occurs because locks are acquired deterministically in UUID order
        assertTrue(completedNoDeadlock, "All concurrent cross-transfers must complete without deadlocking");
        assertEquals(4, completedCount.get(), "All 4 transfers should complete successfully");

        // Total money between Account A and Account B must be conserved: ₹5000 + ₹5000 = ₹10000
        AccountBalance balA = accountBalanceRepository.findByAccountId(idA).orElseThrow();
        AccountBalance balB = accountBalanceRepository.findByAccountId(idB).orElseThrow();
        assertEquals(new BigDecimal("10000.0000"), balA.getBalance().add(balB.getBalance()), "Combined balance must strictly remain ₹10,000.0000");
    }
}
