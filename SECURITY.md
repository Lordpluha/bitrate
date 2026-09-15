# Security Policy

## 🔒 Supported Versions

We support the security of the following project versions:

| Version | Supported          |
| ------- | ------------------ |
| master  | ✅ Active support |
| develop | ✅ Active development |
| < 1.0   | ❌ Not supported |

## 🐛 Reporting a Vulnerability

The security of our users is our top priority. If you have discovered a vulnerability in the project, please report it to us **confidentially**.

### How to report a vulnerability

**Do NOT create a public issue** for reporting security vulnerabilities.

Instead:

1. **Email:** Send a detailed description of the vulnerability to:
   - 📧 **vladislavteslyukofficial@gmail.com**

2. **GitHub Security Advisories** (recommended):
   - Go to the [Security](https://github.com/Lordpluha/bitrate/security) tab
   - Click "Report a vulnerability"
   - Fill in the form with details

### What to include in your report

For a quick response, please include:

- **Vulnerability type** (XSS, SQL Injection, CSRF, etc.)
- **Affected components** (API, Web, Mobile, Desktop)
- **Steps to reproduce** (step-by-step)
- **Potential impact** (what an attacker could do)
- **Suggested fix** (if any)
- **Project version** or commit hash
- **Screenshots/video** (if applicable)

### Handling process

After receiving a vulnerability report:

1. ✅ **Acknowledgment** - within **48 hours**
2. 🔍 **Vulnerability analysis** - within **7 days**
3. 🛠️ **Patch development** - depends on severity
4. 📦 **Fix release** - with credit to reporter (if agreed)
5. 📢 **Public announcement** - after patch release

### Severity Levels

We use the following vulnerability classification:

| Level | Description | SLA Response |
|-------|-------------|--------------|
| 🔴 **Critical** | Remote code execution, full system compromise | 24 hours |
| 🟠 **High** | User data leak, authentication bypass | 48 hours |
| 🟡 **Medium** | Unauthorized access to restricted data | 7 days |
| 🟢 **Low** | Minimal information disclosure, DoS | 14 days |

## 🛡️ Security Best Practices

When working with the project, follow these rules:

### For developers

- ✅ Never commit `.env` files with real credentials
- ✅ Keep deploy and CI values in GitHub environment secrets and variables, never in a
  committed file — a repository-root `.env` is not part of this project's setup
- ✅ Document an app's variables in that app's own `.env.example`, values elided
- ✅ Regularly update dependencies: `pnpm update`
- ✅ Check for vulnerabilities: `pnpm audit`
- ✅ Use pre-commit hooks to check for secrets
- ✅ Validate all user input
- ✅ Use parameterized queries (Prisma does this automatically)
- ✅ Store passwords only in hashed form (bcrypt/argon2)

### For deployment

- ✅ Use HTTPS in production
- ✅ Configure CORS properly (do not use `*` in production)
- ✅ Enable Rate Limiting (already configured in the API)
- ✅ Use CSP (Content Security Policy)
- ✅ Store secrets in a secrets manager (not in .env files)
- ✅ Regularly back up the database
- ✅ Monitor logs for suspicious activity
- ✅ Use 2FA for critical services

## 🔐 Security Features

The project already includes the following security measures:

### Backend (NestJS API)

- ✅ **JWT Authentication** with refresh tokens
- ✅ **OAuth 2.0** (Google, Facebook, Discord)
- ✅ **2FA (Two-Factor Authentication)**
- ✅ **Rate Limiting** via `@nestjs/throttler`
- ✅ **CORS** configuration
- ✅ **CSP (Content Security Policy)**
- ✅ **Helmet** for HTTP header security
- ✅ **CSRF Protection**
- ✅ **IP-based rate limiting and banning**
- ✅ **Fingerprint Authentication**
- ✅ **File Upload Security** via Multer with validation
- ✅ **SHA-3** for hashing
- ✅ **Global Error Filters** to prevent information leakage
- ✅ **Prisma** (SQL Injection protection)

### Frontend (Next.js Web)

- ✅ **Server-side validation** via Server Actions
- ✅ **Zod validation** for all forms
- ✅ **CSP Headers** via middleware
- ✅ **CORS** configuration
- ✅ **Secure cookies** (httpOnly, secure, sameSite)
- ✅ **MSW** for secure API testing

### Infrastructure

- ✅ **Docker** service isolation
- ✅ **Environment variables** via env.schema validation
- ✅ **PostgreSQL** with proper user permissions
- ✅ **Redis** for session management
- ✅ **Cloudflare** ready (mentioned in stack)
- ✅ **Sentry** for error monitoring

## 📋 Security Checklist

Before deploying to production:

- [ ] All `.env` files in `.gitignore`
- [ ] Secrets moved to secrets manager
- [ ] HTTPS enabled and configured
- [ ] CORS configured correctly (not `*`)
- [ ] Rate limiting tested
- [ ] All dependencies updated (`pnpm audit`)
- [ ] CSP headers configured
- [ ] Cookie settings: httpOnly, secure, sameSite
- [ ] Database backups configured
- [ ] Monitoring and alerting configured
- [ ] 2FA enabled for admin accounts
- [ ] SQL injection tests passed
- [ ] XSS tests passed
- [ ] CSRF protection working

## 🏆 Responsible Disclosure

We are grateful to security researchers who help make the project safer.

**Recognition:**
- Researchers who responsibly disclose vulnerabilities will be mentioned in the CHANGELOG
- Upon request, we can add you to CONTRIBUTORS.md
- For critical vulnerabilities, a reward may be considered (bug bounty)

## 📞 Contacts

- **Vladyslav Tesliuk** (Lead Developer)
  - Email: vladislavteslyukofficial@gmail.com
  - GitHub: [@Lordpluha](https://github.com/Lordpluha)

---

**Thank you for helping keep this project secure! 🙏**

*Last updated: June 2026*
