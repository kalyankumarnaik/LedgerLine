package com.ledgerline.exception;

public class UnauthorizedAccountAccessException extends LedgerLineException {
    public UnauthorizedAccountAccessException(String message) {
        super(message);
    }
}
