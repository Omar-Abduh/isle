<div align="center">

![Isle Logo](apps/desktop/public/Isle-logo-blue.svg)

</div>

# Security Policy

## Reporting Vulnerabilities

**Do not open public GitHub issues for security vulnerabilities.**

If you discover a security vulnerability in Isle, please report it responsibly by emailing **[security contact needed]** with the following information:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact and severity
- Any suggested fixes (if applicable)

We will acknowledge your report within 48 hours and provide a timeline for remediation.

---

## Security Best Practices

### For Deployments

1. **Environment Variables**: Never commit API keys, JWT secrets, or database credentials. Use `.env` files and Docker secrets.
2. **HTTPS Only**: Always use TLS/HTTPS in production. Update `nginx.conf` with valid SSL certificates from Let's Encrypt.
3. **Database Credentials**: Use strong, randomly generated passwords (minimum 32 characters).
4. **JWT Keys**: Store RSA private keys securely. Rotate keys periodically.
5. **CORS Configuration**: Restrict `CORS_ALLOWED_ORIGIN_PATTERNS` to your specific frontend domain(s).
6. **Rate Limiting**: Consider implementing rate limiting on the API to prevent abuse.

### For Development

1. **Local Secrets**: Never commit `.env.local` or secrets to version control. Use `.gitignore`.
2. **Dependency Updates**: Keep dependencies up to date. Use `npm audit` and `mvn dependency:check` regularly.
3. **Code Review**: All changes should be peer-reviewed before merging.
4. **Testing**: Write unit and integration tests to catch security regressions.

### OAuth 2.0 PKCE Flow

Isle uses Google OAuth 2.0 with PKCE to prevent authorization code interception. This is secure by design, but ensure:

- Your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are kept confidential.
- The `REDIRECT_URI` in your OAuth app settings matches your deployment URL exactly.
- Refresh tokens are stored securely (e.g., Tauri Stronghold for the desktop app).

### Timezone Integrity

The backend enforces `X-Timezone` headers to ensure streak calculations are not manipulated by time zone spoofing. Never bypass this validation in custom deployments.

### Database Security

- Enable PostgreSQL SSL connections in production.
- Use strong authentication (password or certificate-based).
- Implement row-level security (RLS) policies for multi-tenant scenarios.
- Keep database backups encrypted and stored securely.
- Run regular security audits on database permissions.

---

## Dependency Vulnerabilities

To check for known vulnerabilities in dependencies:

```bash
# Frontend
pnpm audit

# Backend
mvn dependency:check
```

Address critical and high-severity vulnerabilities immediately. Medium and low-severity issues should be monitored but can be prioritized based on exploitability.

---

## Compliance

- **Data Privacy**: Isle does not store sensitive personal data beyond email and timezone. Ensure GDPR compliance if serving EU users.
- **Encryption**: Passwords are not stored (OAuth 2.0 delegates to Google). Refresh tokens are stored securely.
- **Audit Logging**: Consider implementing audit logs for administrative actions in production.

---

## Version Support

We support security patches for the latest minor version only. Users should upgrade promptly when security updates are released.

---

## Questions?

For security-related questions that are not vulnerability reports, please open a private discussion in the GitHub repository or reach out to **[security contact needed]**.

Thank you for helping keep Isle secure.
