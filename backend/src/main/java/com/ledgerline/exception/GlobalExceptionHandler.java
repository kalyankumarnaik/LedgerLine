package com.ledgerline.exception;

import com.ledgerline.dto.response.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(InsufficientFundsException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientFunds(InsufficientFundsException ex) {
        String correlationId = UUID.randomUUID().toString();
        log.warn("Insufficient funds exception [corr={}]: {}", correlationId, ex.getMessage());
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "INSUFFICIENT_FUNDS", ex.getMessage(), correlationId);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(AccountInactiveException.class)
    public ResponseEntity<ErrorResponse> handleAccountInactive(AccountInactiveException ex) {
        String correlationId = UUID.randomUUID().toString();
        log.warn("Account inactive exception [corr={}]: {}", correlationId, ex.getMessage());
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "ACCOUNT_INACTIVE", ex.getMessage(), correlationId);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(IdempotencyConflictException.class)
    public ResponseEntity<ErrorResponse> handleIdempotencyConflict(IdempotencyConflictException ex) {
        String correlationId = UUID.randomUUID().toString();
        log.warn("Idempotency conflict [corr={}]: {}", correlationId, ex.getMessage());
        ErrorResponse error = new ErrorResponse(HttpStatus.CONFLICT.value(), "IDEMPOTENCY_CONFLICT", ex.getMessage(), correlationId);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(IdempotencyProcessingException.class)
    public ResponseEntity<ErrorResponse> handleIdempotencyProcessing(IdempotencyProcessingException ex) {
        String correlationId = UUID.randomUUID().toString();
        log.warn("Idempotency concurrent processing [corr={}]: {}", correlationId, ex.getMessage());
        ErrorResponse error = new ErrorResponse(HttpStatus.CONFLICT.value(), "REQUEST_ALREADY_PROCESSING", ex.getMessage(), correlationId);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(UnauthorizedAccountAccessException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedAccountAccess(UnauthorizedAccountAccessException ex) {
        String correlationId = UUID.randomUUID().toString();
        log.warn("Unauthorized account access attempt [corr={}]: {}", correlationId, ex.getMessage());
        ErrorResponse error = new ErrorResponse(HttpStatus.FORBIDDEN.value(), "UNAUTHORIZED_ACCOUNT_ACCESS", ex.getMessage(), correlationId);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(TransactionLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleLimitExceeded(TransactionLimitExceededException ex) {
        String correlationId = UUID.randomUUID().toString();
        log.warn("Transaction limit exceeded [corr={}]: {}", correlationId, ex.getMessage());
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "TRANSACTION_LIMIT_EXCEEDED", ex.getMessage(), correlationId);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        String correlationId = UUID.randomUUID().toString();
        ErrorResponse error = new ErrorResponse(HttpStatus.NOT_FOUND.value(), "RESOURCE_NOT_FOUND", ex.getMessage(), correlationId);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(AccountingInvariantViolationException.class)
    public ResponseEntity<ErrorResponse> handleInvariantViolation(AccountingInvariantViolationException ex) {
        String correlationId = UUID.randomUUID().toString();
        log.error("CRITICAL: Accounting invariant violated [corr={}]: {}", correlationId, ex.getMessage(), ex);
        ErrorResponse error = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "INVARIANT_VIOLATION", "A critical accounting error occurred. Transaction aborted.", correlationId);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        String correlationId = UUID.randomUUID().toString();
        log.warn("Access denied [corr={}]: {}", correlationId, ex.getMessage());
        ErrorResponse error = new ErrorResponse(HttpStatus.FORBIDDEN.value(), "ACCESS_DENIED", "You do not have permission to perform this action.", correlationId);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        String correlationId = UUID.randomUUID().toString();
        ErrorResponse error = new ErrorResponse(HttpStatus.UNAUTHORIZED.value(), "BAD_CREDENTIALS", "Invalid username or password.", correlationId);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        String correlationId = UUID.randomUUID().toString();
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "VALIDATION_FAILED", "Invalid request parameters.", correlationId);
        error.setValidationErrors(errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        String correlationId = UUID.randomUUID().toString();
        log.error("Unhandled exception [corr={}]: {}", correlationId, ex.getMessage(), ex);
        ErrorResponse error = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "INTERNAL_SERVER_ERROR", "An unexpected error occurred. Reference ID: " + correlationId, correlationId);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
