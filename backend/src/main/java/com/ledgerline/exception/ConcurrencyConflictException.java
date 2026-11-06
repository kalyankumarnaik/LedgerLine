package com.ledgerline.exception;

public class ConcurrencyConflictException extends LedgerLineException {
    public ConcurrencyConflictException(String message) {
        super(message);
    }

    public ConcurrencyConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
