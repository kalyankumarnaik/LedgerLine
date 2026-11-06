package com.ledgerline.exception;

public class TransactionLimitExceededException extends LedgerLineException {
    public TransactionLimitExceededException(String message) {
        super(message);
    }
}
