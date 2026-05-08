package com.isle.auth.repository;

import com.isle.auth.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /**
     * @Transactional is required on @Modifying repository methods that may be
     * called from callers that do not already hold a transaction (e.g.
     * AuthController.logout() calls this directly without a service-layer
     * @Transactional wrapping it). Without it Spring throws
     * TransactionRequiredException at runtime.
     */
    @Transactional
    @Modifying
    @Query("UPDATE RefreshToken t SET t.revoked = true WHERE t.userId = :userId")
    void revokeAllForUser(UUID userId);

    @Transactional
    @Modifying
    @Query("DELETE FROM RefreshToken t WHERE t.expiresAt < CURRENT_TIMESTAMP OR t.revoked = true")
    void deleteExpiredAndRevoked();
}
