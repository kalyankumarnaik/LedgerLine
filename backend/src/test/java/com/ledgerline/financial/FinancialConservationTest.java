package com.ledgerline.financial;

import com.ledgerline.domain.*;
import com.ledgerline.domain.enums.*;
import com.ledgerline.dto.request.DepositRequest;
import com.ledgerline.dto.request.TransferRequest;
import com.ledgerline.dto.request.WithdrawRequest;
import com.ledgerline.dto.response.TransactionDto;
import com.ledgerline.repository.*;
import com.ledgerline.service.FinancialEngineService;
import com.ledgerline.service.ReconciliationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class FinancialConservationTest {

    @Autowired
    private FinancialEngineService financialEngineService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AccountBalanceRepository accountBalanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private LedgerEntryRepository ledgerEntryRepository;

    @Autowired
    private ReconciliationService reconciliationService;

    private User testUser;
    private Account sourceAccount;
    private Account destAccount;

    @BeforeEach
    void setUp() {
        testUser = userRepository.findByUsername("alex").orElseThrow();
        sourceAccount = accountRepository.findByAccountNumber("LL-CHK-10020491").orElseThrow();
    }

    @Test
    @DisplayName("Conservation Test: Internal transfer preserves total money and creates balanced ledger entries")
    void testTransferConservation() {
        // Create destination account
        destAccount = new Account("LL-TEST-DEST-001", testUser, "Dest Test", AccountType.CHECKING, "INR");
        destAccount = accountRepository.save(destAccount);
        AccountBalance destBal = new AccountBalance(destAccount, new BigDecimal("1000.0000"));
        accountBalanceRepository.save(destBal);

        AccountBalance srcBalBefore = accountBalanceRepository.findByAccountId(sourceAccount.getId()).orElseThrow();
        BigDecimal initialSource = srcBalBefore.getBalance();
        BigDecimal initialDest = destBal.getBalance();
        BigDecimal initialTotal = initialSource.add(initialDest);

        BigDecimal transferAmount = new BigDecimal("2500.0000");
        TransferRequest request = new TransferRequest(
                sourceAccount.getId(),
                destAccount.getAccountNumber(),
                transferAmount,
                "Conservation Test Transfer",
                UUID.randomUUID().toString()
        );

        TransactionDto result = financialEngineService.executeTransfer(request, testUser);
        assertNotNull(result);
        assertEquals(TransactionStatus.POSTED, result.getStatus());

        AccountBalance srcBalAfter = accountBalanceRepository.findByAccountId(sourceAccount.getId()).orElseThrow();
        AccountBalance destBalAfter = accountBalanceRepository.findByAccountId(destAccount.getId()).orElseThrow();

        // 1. Invariant: Source decreased by exact amount
        assertEquals(initialSource.subtract(transferAmount), srcBalAfter.getBalance());

        // 2. Invariant: Destination increased by exact amount
        assertEquals(initialDest.add(transferAmount), destBalAfter.getBalance());

        // 3. Invariant: Total money strictly conserved (no money created or lost)
        BigDecimal finalTotal = srcBalAfter.getBalance().add(destBalAfter.getBalance());
        assertEquals(initialTotal, finalTotal);

        // 4. Invariant: Reconciled ledger matches materialized balance
        BigDecimal reconciled = ledgerEntryRepository.calculateReconciledBalance(destAccount.getId());
        assertEquals(destBalAfter.getBalance(), reconciled);
    }

    @Test
    @DisplayName("Conservation Test: Deposit correctly credits account and debits central clearing reserve")
    void testDepositConservation() {
        BigDecimal depositAmount = new BigDecimal("5000.0000");
        AccountBalance balBefore = accountBalanceRepository.findByAccountId(sourceAccount.getId()).orElseThrow();
        BigDecimal initialBal = balBefore.getBalance();

        DepositRequest request = new DepositRequest(
                sourceAccount.getId(),
                depositAmount,
                "Deposit test",
                UUID.randomUUID().toString()
        );

        TransactionDto result = financialEngineService.executeDeposit(request, testUser);
        assertEquals(TransactionStatus.POSTED, result.getStatus());

        AccountBalance balAfter = accountBalanceRepository.findByAccountId(sourceAccount.getId()).orElseThrow();
        assertEquals(initialBal.add(depositAmount), balAfter.getBalance());
    }

    @Test
    @DisplayName("Conservation Test: Withdrawal correctly debits account and credits central clearing reserve")
    void testWithdrawalConservation() {
        BigDecimal withdrawAmount = new BigDecimal("1500.0000");
        AccountBalance balBefore = accountBalanceRepository.findByAccountId(sourceAccount.getId()).orElseThrow();
        BigDecimal initialBal = balBefore.getBalance();

        WithdrawRequest request = new WithdrawRequest(
                sourceAccount.getId(),
                withdrawAmount,
                "Withdrawal test",
                UUID.randomUUID().toString()
        );

        TransactionDto result = financialEngineService.executeWithdraw(request, testUser);
        assertEquals(TransactionStatus.POSTED, result.getStatus());

        AccountBalance balAfter = accountBalanceRepository.findByAccountId(sourceAccount.getId()).orElseThrow();
        assertEquals(initialBal.subtract(withdrawAmount), balAfter.getBalance());
    }
}
