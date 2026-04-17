# Changelog

All notable changes to **Savor** will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-04-17

### 🎉 Initial Production Release

#### Added
- **Customer Portal** — Full discovery engine with global cuisine categories and restaurant-level menu browsing.
- **Restaurant Partner Dashboard** — CRUD menu management, order lifecycle controls (Pending → Preparing → Ready), and revenue metrics.
- **Delivery Agent Interface** — Agent availability toggle, geo-fenced order dispatch queue, live GPS broadcast, and earnings tracker.
- **Admin Console** — God-mode oversight with server-side pagination for 3,000+ items, financial auditing, and fleet/user management.
- **JWT Authentication** — Silent token rotation via Axios interceptors. Access tokens expire in 60 minutes; refresh tokens rotate every 7 days.
- **Razorpay Integration** — Secure payment gateway with webhook verification and transaction status tracking.
- **Cloudinary Media Storage** — Edge-cached image delivery for all restaurant and menu item assets.
- **Real-Time GPS Tracking** — Leaflet.js-powered interactive map showing live delivery agent coordinates.
- **WhiteNoise Static Storage** — Manifest-locked compressed static files for production reliability.
- **Seed Script** (`seed_kerala`) — Pre-loads Kerala-specific cuisine categories and initial restaurant data.
- **Postman Collection** — Full API documentation at `backend/postman.json`.
- **Render Deployment** — Automated `build.sh` script for one-click Render backend deployment.
- **Vercel Deployment** — Frontend optimized with `vercel.json` SPA routing config.

#### Technical Stack
- Django 5.1 + Django REST Framework
- React 19 + Vite
- Tailwind CSS 4.0
- Framer Motion animations
- PostgreSQL database
- SimpleJWT with blacklisting

---

## [Unreleased]

### Planned
- Push notifications for order status updates
- Multi-language (i18n) support
- Driver rating system post-delivery
- Restaurant analytics dashboard v2

---

> Use `[Unreleased]` section to track incoming changes before tagging a new release.
