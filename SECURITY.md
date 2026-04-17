# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Yes     |

---

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in Savor, please report it responsibly:

1. **Email**: Contact the maintainer privately via GitHub (use the "Report a vulnerability" button in the Security tab).
2. **Include**:
   - A clear description of the vulnerability
   - Steps to reproduce it
   - Potential impact
   - Any suggested fix (optional but appreciated)

### What to Expect

- **Acknowledgement**: Within **48 hours** of your report.
- **Status Update**: Within **7 days** with an assessment and timeline.
- **Resolution**: Critical vulnerabilities will be patched within **14 days**.
- **Credit**: Security reporters will be credited in the `CHANGELOG.md` unless they prefer to remain anonymous.

---

## Security Best Practices for Deployments

When self-hosting Savor, ensure:

- [ ] `DEBUG=False` in production Django settings
- [ ] A strong, unique `SECRET_KEY` (never commit it)
- [ ] `ALLOWED_HOSTS` restricted to your domain only
- [ ] `HTTPS` enforced (`SECURE_SSL_REDIRECT=True`)
- [ ] JWT tokens stored in `httpOnly` cookies if possible
- [ ] Razorpay webhook signature verification enabled
- [ ] Database credentials stored only in environment variables
- [ ] Cloudinary API secrets never exposed to the frontend

---

## Known Security Features

- **Silent JWT Rotation**: Access tokens expire in 60 min; refresh tokens rotate and blacklist old ones via `djangorestframework-simplejwt`.
- **HSTS**: HTTP Strict Transport Security headers enforced in production.
- **CSRF Protection**: Django's built-in CSRF middleware active on all non-API views.
- **Atomic Transactions**: Profile updates use `@transaction.atomic` to prevent partial saves.
- **Razorpay Signature Verification**: All payment confirmations are server-side verified using HMAC-SHA256.
