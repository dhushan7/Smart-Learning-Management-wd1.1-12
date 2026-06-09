package com.smartlearning.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // Modern 0.12.x secure secure key generation syntax for HMAC-SHA256
    private final SecretKey key = Jwts.SIG.HS256.key().build();
    private final long JWT_EXPIRATION_MS = 86400000; // 24 Hours

    public String generateToken(String username, String role, String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION_MS);

        // Standard claims, extra claims, and signWith are now modern and fluent
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .claim("email", email)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key) // Algorithm is automatically inferred from the key type
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            // Jwts.parserBuilder() is now Jwts.parser()
            Jwts.parser()
                    .verifyWith(key) // setSigningKey() is replaced by verifyWith()
                    .build()
                    .parseSignedClaims(token); // parseClaimsJws() is replaced by parseSignedClaims()
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload(); // getBody() is replaced by getPayload()

        return claims.getSubject();
    }
}