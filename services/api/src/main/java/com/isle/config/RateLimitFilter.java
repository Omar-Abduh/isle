package com.isle.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int  CAPACITY     = 10;
    private static final long REFILL_PERIOD_SECONDS = 60;

    private final LoadingCache<String, Bucket> buckets = Caffeine.newBuilder()
        .expireAfterAccess(10, TimeUnit.MINUTES)
        .build(ip -> Bucket.builder()
            .addLimit(Bandwidth.builder()
                .capacity(CAPACITY)
                .refillGreedy(CAPACITY, Duration.ofSeconds(REFILL_PERIOD_SECONDS))
                .build())
            .build());

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain)
            throws IOException, ServletException {

        if (!req.getRequestURI().startsWith("/api/v1/auth/")) {
            chain.doFilter(req, res);
            return;
        }

        String clientIp = resolveClientIp(req);
        Bucket bucket = buckets.get(clientIp);

        if (bucket.tryConsume(1)) {
            chain.doFilter(req, res);
        } else {
            log.warn("Rate limit exceeded for IP: {}", clientIp);
            res.setStatus(429);
            res.setContentType("application/problem+json");
            // RFC 6585 §4 — inform the client when it may retry
            res.setHeader("Retry-After", String.valueOf(REFILL_PERIOD_SECONDS));
            res.getWriter().write("{\"title\":\"Too Many Requests\",\"status\":429}");
        }
    }

    /**
     * Resolves the real client IP address.
     *
     * <p>Behind a reverse proxy or load balancer, {@code req.getRemoteAddr()}
     * returns the proxy's IP, causing all users to share a single rate-limit
     * bucket (either rendering the limit useless or blocking everyone at once).
     *
     * <p>We check standard proxy-forwarding headers in priority order before
     * falling back to the direct connection address.
     *
     * <p><strong>Security note:</strong> X-Forwarded-For can be spoofed by
     * clients. Ensure the reverse proxy is configured to overwrite (not append)
     * this header so that only the proxy-inserted value is trusted.
     */
    private String resolveClientIp(HttpServletRequest req) {
        // X-Forwarded-For may contain a comma-separated chain; the first entry is
        // the original client IP as set by the outermost trusted proxy.
        String xForwardedFor = req.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = req.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }

        return req.getRemoteAddr();
    }
}
