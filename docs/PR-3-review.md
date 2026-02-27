# PR #3 Review: Security hardening + WebSocket real-time chat

**Author:** Skanda (@skandac)  
**Branch:** `aws-deployment-test` → `aws-deployment`  
**Reviewer:** (automated review)

---

## Summary

The PR adds BCrypt password hashing, endpoint-level Spring Security authorization, and real-time chat via STOMP over WebSocket with REST fallback. Tests are updated. Overall direction is good; a few blocking and non-blocking items should be addressed before or right after merge.

---

## What’s good

- **BCrypt + AuthService/UserService:** Passwords are hashed on registration and checked on login. OAuth users correctly keep `passwordHash == null` and are unaffected.
- **SecurityConfig:** Sensible split: public (health, auth, OAuth, Swagger, `/ws/**`), read-only public (listings/reviews/users GET), write requires auth. `SessionCreationPolicy.STATELESS` fits JWT.
- **QA fallback removed:** Listing creation no longer uses a hardcoded QA user when unauthenticated; it properly requires auth.
- **WebSocket design:** JWT in `Authorization` on CONNECT, `WebSocketAuthInterceptor` sets principal, `ChatWebSocketController` and REST `ChatController` both broadcast so clients get messages whether they send via WS or REST.
- **Frontend:** STOMP client with REST fallback, `connected` state, and subscription cleanup on unmount look correct.
- **Tests:** Controllers and services updated for new security and mocks.

---

## Blocking: database migration for `password_hash`

**Issue:** `User` has `@Column(name = "password_hash")` but there is **no Flyway migration** adding this column. Existing databases (e.g. production) will fail when the app starts or when a user is created.

**Required:** Add a migration, e.g.:

- `api/src/main/resources/db/migration/V9__add_password_hash_to_users.sql`  
  Content: `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;`  
  (or equivalent for your DB; use `IF NOT EXISTS` or equivalent to keep it idempotent if needed.)

Without this, deploy to any environment with an existing `users` table will break.

---

## Blocking: WebSocket and CORS in production

**Issue 1 – Nginx:** There is no `location /ws` in `deploy/nginx-host.conf`. In production, the browser connects to `wss://everything-umass.tech/ws/websocket`. That must be proxied to the API with WebSocket upgrade headers; otherwise the connection will never reach Spring.

**Required:** Add a block like this (and mirror it in any Certbot 443 block if you use a separate one):

```nginx
location /ws/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Issue 2 – Allowed origins:** `WebSocketConfig` and `SecurityConfig` (CORS) only allow `http://localhost:*` and `http://127.0.0.1:*`. In production the browser sends `Origin: https://everything-umass.tech`. The WebSocket handshake (and any CORS preflight) can be rejected if the server doesn’t allow that origin.

**Required:** Allow the production origin (or a pattern) in:

- `WebSocketConfig.registerStompEndpoints`: e.g. add `https://everything-umass.tech` (or a pattern) to `setAllowedOriginPatterns`.
- `SecurityConfig.corsConfigurationSource`: add the same origin to `setAllowedOriginPatterns` so CORS and WebSocket are consistent.

Otherwise real-time chat (and possibly other cross-origin requests) will fail in production.

---

## Non-blocking suggestions

1. **UserService.updateUser:** It doesn’t update `passwordHash`. If you later add “change password,” you’ll need to hash and set it here (or in a dedicated endpoint). Fine to leave as-is for this PR.
2. **ChatContext WS URL:** `WS_URL` is derived from `VITE_API_BASE_URL`. In production that should be `https://everything-umass.tech`, so the client will use `wss://...`. Good; just ensure `VITE_API_BASE_URL` is set correctly in the build used for production.
3. **Tests:** PR says 32 tests passing; running `mvn test` after merge is recommended to catch any environment-specific failures.
4. **SecurityConfig `/auth/success`:** You have `.requestMatchers("/auth/success").permitAll()`. If that path is only a frontend route and never hits the API, this is harmless; if the API serves it, keeping it public is intentional.

---

## Checklist before merge

- [ ] Add Flyway migration `V9__add_password_hash_to_users.sql` (or next version) for `password_hash`.
- [ ] Add nginx `location /ws/` with WebSocket upgrade headers to `deploy/nginx-host.conf` (and 443 block if used).
- [ ] Allow `https://everything-umass.tech` (or production origin) in `WebSocketConfig` and in `SecurityConfig` CORS.
- [ ] Run `mvn test` and confirm all pass.
- [ ] Optionally: test WebSocket locally (e.g. `npm run dev` + API on 8080, then test chat) and, after the above, smoke-test on staging/production.

---

## Verdict

**Approve with changes.** The security and WebSocket design are solid. Address the migration and production WebSocket/nginx + origin configuration (and re-run tests) before or immediately after merging so production and existing DBs don’t break.
