package com.ledgerline.exception;

public class IdempotencyProcessingException extends LedgerLineException {
    public IdempotencyProcessingException(String message) {
        super(message);
    }
}
