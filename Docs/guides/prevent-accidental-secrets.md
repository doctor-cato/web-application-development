# Prevent Accidental Secrets In The Repo

Small guide to reduce the risk of accidentally committing secrets or `.env` files.

1) `.env` usage
   - Keep `.env` in `.gitignore`.
   - Provide only `.env.example` in the repository with placeholders (no real credentials).

2) Recommended `.env.example` content
   - See `docs/.env.example` for a minimal example. Use only placeholders and short comments.

3) Pre-commit tooling (recommended)
   - Use `pre-commit` with the `detect-secrets` hook or `git-secrets` to scan commits for high-entropy strings and common secret patterns.
   - Minimal pre-commit example (.pre-commit-config.yaml):

```yaml
- repo: https://github.com/Yelp/detect-secrets
  rev: v1.0.3
  hooks:
    - id: detect-secrets
      args: ["--baseline", ".secrets.baseline"]
```

4) CI checks
   - Add a secrets-scan step in CI (GitHub Actions, GitLab CI) that fails the build if potential secrets are found.

5) Recovery plan
   - If a secret is accidentally committed: rotate/revoke the secret immediately, remove it from history (use caution), and notify stakeholders.

6) Short checklist for contributors
   - Never paste production credentials in code or docs.
   - Use placeholders in PRs (e.g., `MONGO_URI=REPLACE_WITH_SECRET_STORE_VALUE`).
   - Redact logs before sharing externally.
