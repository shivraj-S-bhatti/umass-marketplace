package edu.umass.marketplace.common.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

public class JwtUtil {

    private final Algorithm algorithm;
    private final long expirationMillis;

    public JwtUtil(String secret, long expirationMillis) {
        this.algorithm = Algorithm.HMAC256(secret);
        this.expirationMillis = expirationMillis;
    }

    public String generateToken(UUID userId, String email, String name) {
        Instant now = Instant.now();
        Date issuedAt = Date.from(now);
        Date expiresAt = Date.from(now.plusMillis(expirationMillis));

        return JWT.create()
            .withSubject(userId.toString())
            .withClaim("email", email)
            .withClaim("name", name)
            .withIssuedAt(issuedAt)
            .withExpiresAt(expiresAt)
            .sign(algorithm);
    }

    public com.auth0.jwt.interfaces.DecodedJWT verifyToken(String token) {
        com.auth0.jwt.JWTVerifier verifier = com.auth0.jwt.JWT.require(algorithm).build();
        return verifier.verify(token);
    }

    public java.util.UUID getUserIdFromToken(String token) {
        com.auth0.jwt.interfaces.DecodedJWT decoded = verifyToken(token);
        return java.util.UUID.fromString(decoded.getSubject());
    }
}
