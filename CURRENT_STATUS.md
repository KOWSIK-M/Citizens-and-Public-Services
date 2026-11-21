# ClaimSaathi – Current Status (v4.0 — Full-Stack Neon, JWT Auth/RBAC, Sector Visualization & Gmail SMTP Release)

## 1. Release Summary

- **Phase:** Full `v4.0` Production Architecture Complete & Verified — **zero runtime mock data**, 100% live Neon PostgreSQL backend, simple HS256 JWT authentication + RBAC authorization, personalised profile dashboard, interactive **Availed vs. Still Likely Eligible** sector visualization with filters, live recent government schemes & start/end date notifications, and direct **Gmail SMTP** deadline alerts.
- **Verification Health:**
  - Strict TypeScript (`tsc && vite build`): **0 errors, 0 warnings**
  - Production Bundle Optimization: **`58.14 kB` gzip** main entry chunk (`20%` leaner after removing runtime mocks) + route-level lazy chunks (`SectorCoverageVisualizer`: `6.28 kB`, `NotificationsPage`: `4.17 kB`, `AuthPage`: `3.31 kB`)
  - Automated `Vitest` Test Suite (`npm test`): **`73 / 73` tests passing** across **9 suites**
  - Responsive Layout Audit: **`0.00px` horizontal overflow** verified at `360×780`

---

## 2. Release Highlights Across All Modules

1. **Zero Runtime Mock Data — 100% Live Neon PostgreSQL (`api/_lib/db.ts`):** All schemes, editable rules, audit logs, users, profiles, applications, notifications, and community discussions read/write directly against Neon (`001`–`003` migrations & seeds, runnable via `node scripts/apply-neon-migrations.mjs`). Vite dev server mounts all `/api/*` handlers natively.
2. **Simple HS256 JWT Auth & RBAC (`api/_lib/auth.ts`, `/login`):** `scryptSync` password hashing, `HttpOnly` cookie + `Bearer` token, `citizen` vs `admin` role authorization (`ADMIN_INVITE_CODE`), protecting `/profile`, `/api/applications`, and `/admin` (`PATCH /api/admin/schemes`).
3. **Personalised Profile & Interactive Sector Coverage Visualization (`/profile`, `/my-schemes`):** Neon-persisted coarse household profile paired with `SectorCoverageVisualizer.tsx` (Government Level, Welfare Sector, Coverage Status, & Sort filters; SVG Donut Coverage Ring; Stacked Sector Comparison Bars; ₹ Claimed vs ₹ Unclaimed KPIs; and 2-column Availed vs Still Likely Eligible drilldown).
4. **Recent Government Schemes, Start/End Date Notifications & Gmail SMTP Mailer (`/notifications`):** Live Neon scheme announcements, opening/closing countdowns, Header Notification Bell unread badge, opt-in Gmail alert signup, `nodemailer` Gmail SMTP (`POST /api/notifications/send-email`), and daily Vercel Cron (`GET /api/notifications/cron`).
5. **All 6 v3.0 Open-Source Civic Modules Retained & Neon-Connected:** Saathi Live Voice Call (`/voice-call`), 26-District Sachivalayam/MeeSeva Locator (`/centres`), 3-Module API Setu Suite, Claim Doctor Rejection Troubleshooter (`/my-schemes`), Missing-Scheme 10-Vote Escalation Dossier, and PII-Shielded Citizen Community Chat (`/community`).
