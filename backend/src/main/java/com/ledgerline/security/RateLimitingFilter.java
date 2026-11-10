package com.ledgerline.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ledgerline.service.RateLimiterService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RateLimitingFilter(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Skip rate limiting for static resources and health liveness
        if (path.startsWith("/health/") || path.startsWith("/swagger-ui") || path.startsWith("/api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(request);
        RateLimiterService.RateLimitResult result = rateLimiterService.checkLimit(clientIp, path);

        response.setHeader("X-RateLimit-Limit", String.valueOf(result.limit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(result.remaining()));

        if (!result.isAllowed()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(result.retryAfterSeconds()));

            Map<String, Object> errorBody = Map.of(
                "status", 429,
                "error", "Too Many Requests",
                "message", "Rate limit exceeded. Please wait " + result.retryAfterSeconds() + " seconds before retrying.",
                "retryAfterSeconds", result.retryAfterSeconds(),
                "path", path
            );

            response.getWriter().write(objectMapper.writeValueAsString(errorBody));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
