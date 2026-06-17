# Security Policy

**Aemy Finance** handles sensitive financial data — security is a top priority. This document outlines our security practices and how to report vulnerabilities.

---

## Supported Versions

Only the latest production release (deployed on `main`) receives security updates. We do not backport fixes to older versions.

| Version       | Supported        |
| ------------- | ---------------- |
| latest (main) | ✅ Supported     |
| any older     | ❌ Not supported |

---

## Reporting a Vulnerability

If you discover a security vulnerability, **please do not open a public issue**. Instead, report it privately.

### How to Report

1. **Email:** [me@seaavey.com](mailto:me@seaavey.com)
2. **GitHub:** Open a [private security advisory](https://github.com/seaavey/finance/security/advisories/new)

We aim to acknowledge receipt within **48 hours** and provide an initial assessment within **5 business days**.

### What to Include

- Type of vulnerability (XSS, SQL injection, RLS bypass, etc.)
- Steps to reproduce (proof of concept is ideal)
- Affected component or endpoint
- Potential impact
- Any suggested remediation (optional)

### Disclosure Policy

We follow **coordinated disclosure**:

1. Reporter submits vulnerability privately.
2. We triage, confirm, and develop a fix.
3. Fix is deployed to production.
4. We notify the reporter and optionally credit them in release notes.

We ask that you allow us **14 days** from confirmation to deploy a fix before any public disclosure.

---

## Security Measures

This project implements multiple layers of security:

### Authentication & Authorization

- **Google OAuth** — all authentication is delegated to Google; no password storage on our side.
- **Supabase Auth** — session management with refresh token rotation.
- **Row-Level Security (RLS)** — every database table has RLS policies scoped to `user_id`. No user can access another user's data.
- **Partner access** — couple mode shares data via explicit RLS policies granting partner-level read/write, not through admin bypasses.

### Data Protection

- **HTTPS enforced** — all traffic between client and Supabase is encrypted in transit.
- **No secrets in client code** — the Supabase anon key is a public identifier, not a secret. All sensitive operations are protected by RLS policies on the server.
- **Edge Function secrets** — API keys for external services (Resend, exchange rate API) are stored as `supabase secrets`, never in `.env` or client-side code.

### Input Validation

- Supabase parameterized queries prevent SQL injection.
- Client-side validation is provided for UX; server-side enforcement via RLS and database constraints is the source of truth.
- File uploads (goal images) are restricted to Supabase Storage with RLS policies.

### Database

- 11 tables, all with RLS enabled.
- Migrations are reviewed to ensure new tables have appropriate RLS policies before deployment.
- No direct database access from the client beyond what RLS permits.

### Dependencies

- Dependencies are regularly updated via `bun update`.
- We use oxlint and eslint to catch common security anti-patterns.
- The Supabase client library is the only data access layer — no raw database connections.

---

## Security Checklist for Contributors

When contributing code, please ensure:

- [ ] New database tables have **RLS policies** enabled — test with both the owner and a different user.
- [ ] New Edge Functions validate the **`Authorization: Bearer`** header.
- [ ] User input is **never concatenated into SQL queries** — use Supabase's parameterized query builder.
- [ ] No API keys, tokens, or secrets are committed to the repository.
- [ ] CORS headers in Edge Functions are scoped to known origins, not `*`.
- [ ] New routes respect the existing **auth guard** in `router.beforeEach`.

---

## Dependencies & Known Vulnerabilities

We rely on standard tooling to track dependency vulnerabilities:

- Dependencies are audited via `bun audit` and `npm audit` during regular maintenance.
- The Supabase client library is kept up to date to receive security patches.
- Edge Functions run in Deno's secure sandbox with limited permissions.

If you identify a vulnerable dependency, please report it via the process above.

---

## Responsible Disclosure Hall of Fame

We thank the following individuals for their responsible disclosures:

_(None yet — be the first!)_

---

> Last updated: June 2026
