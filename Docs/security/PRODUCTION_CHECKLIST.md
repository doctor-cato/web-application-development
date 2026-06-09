# Production Security & Deployment Checklist

This checklist contains minimal, high-impact security and operational steps to perform before deploying 3HD2Kcinema to a public environment. Keep this document small and practical so it can be used as a pre-deploy gate.

1. Use platform-managed secret stores
   - Do NOT store secrets in repository files. Use your hosting platform's secret manager (Vercel / Render / Railway / Netlify / GitHub Actions secrets / AWS Secrets Manager / Azure Key Vault / GCP Secret Manager).
   - In docs and examples, use placeholders such as `MONGO_URI=REPLACE_WITH_SECRET` not real credentials.

2. Environment variables and .env files
   - Keep `.env` in `.gitignore`. Provide only `.env.example` with placeholders and no real values.
   - For CI/CD, read secrets from the environment, not from committed files.

3. Database access
   - Only allow specific IP addresses to access production databases. Do NOT use `0.0.0.0/0` in production.
   - Use least-privilege database users (separate user for app, read-only users for analytics).

4. Secrets lifecycle
   - Use short-lived credentials when possible and rotate secrets periodically.
   - Store and audit access to secrets. Revoke any leaked credentials immediately.

5. Network and transport
   - Require HTTPS / TLS for all public endpoints. Redirect HTTP to HTTPS.
   - Use secure cookies (HttpOnly, Secure, SameSite as appropriate).

6. Authentication and tokens
   - Use a strong `JWT_SECRET` (long, random). Set appropriate token expirations and consider refresh token patterns.
   - Do not keep long-lived permanent tokens in client code or public files.

7. CORS and client origins
   - Whitelist specific origins (CLIENT_URL) in production. Avoid wildcard `*` or permissive policies.
   - For multiple origins, list them explicitly and validate incoming `Origin` header.

8. Hardening middleware
   - Add security middleware (helmet) and rate-limiting for public APIs.
   - Validate and sanitize inputs. Use strong validation for payment and booking endpoints.

9. Logging and monitoring
   - Do not log secrets or PII. Sanitize logs before sharing with third parties (including AI tools).
   - Set up monitoring and alerts for errors, high error rates, and suspicious activity.

10. Payment provider handling
   - Use provider sandbox/test keys for development.
   - Verify webhooks using provider signatures and store provider secrets only on the server.

11. Deploy-time checks
   - Ensure `NODE_ENV=production` in production builds.
   - Run a quick smoke test after deploy (health check, sample auth, sample booking flow).

12. Pre-commit / CI guardrails
   - Consider adding tooling to catch accidental secret commits (git-secrets, pre-commit hooks).

References
- Example: How to add environment variables in Render: https://render.com/docs/environment-variables
- GitHub Actions: https://docs.github.com/en/actions/security-guides/encrypted-secrets

Keep this checklist short — add env/provider-specific steps where necessary in your deployment instructions.
