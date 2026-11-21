# Kavo Roastery — Production Deployment & Google OAuth Setup Guide

This application supports both the **Cloud SQL + Firebase Auth** backend (active by default) and **Supabase (PostgreSQL + Google OAuth)** for standalone static deployments on Vercel, Netlify, or Render.

---

## 1. Environment Variables

Configure these variables in your hosting provider (Vercel / Netlify / Render) or `.env`:

```bash
# Required for Admin RBAC automatic recognition
ADMIN_EMAIL="ahmadjondadamirzayev6@gmail.com"
VITE_ADMIN_EMAIL="ahmadjondadamirzayev6@gmail.com"

# Optional: Enable direct Supabase backend + Supabase Google OAuth
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

If `VITE_SUPABASE_URL` is omitted, the storefront immediately loads the built-in 12-item specialty coffee catalog and connects to the Express + Cloud SQL backend API (`/api/*`) when available.

---

## 2. Database Schema Setup (Supabase)

1. Open your Supabase project → **SQL Editor**.
2. Paste and execute the contents of `database.sql` from the repository root.
3. This provisions `users`, `products`, `orders`, `order_items`, and `login_logs`, applies Row Level Security (RLS) policies, and seeds all 12 specialty coffees.

---

## 3. Exact 2 URLs for Google OAuth (Live Deployment + Localhost)

### A. Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID
Under **Authorized redirect URIs**, add these exact 2 URLs:
1. **Supabase OAuth Callback URL:**
   ```text
   https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
   ```
2. **Your Live Admin Route (or Local Dev Callback):**
   ```text
   https://<YOUR_LIVE_DOMAIN>/admin
   ```
   *(If testing locally, also include `http://localhost:3000/admin` under Authorized JavaScript origins: `http://localhost:3000` and `https://<YOUR_LIVE_DOMAIN>`.)*

### B. Supabase Dashboard → Authentication → URL Configuration
Under **Redirect URLs**, paste these exact 2 URLs:
1. **Local Development Admin Route:**
   ```text
   http://localhost:3000/admin
   ```
2. **Production Live Domain Admin Route:**
   ```text
   https://<YOUR_LIVE_DOMAIN>/admin
   ```

Set **Site URL** in Supabase Authentication → URL Configuration to `https://<YOUR_LIVE_DOMAIN>`.

---

## 4. Admin Role Assignment

- Any user who signs in with Google on `/admin` has their login attempt recorded in `login_logs` (`granted` or `denied`).
- The email matching `VITE_ADMIN_EMAIL` / `ADMIN_EMAIL` (defaulting to `ahmadjondadamirzayev6@gmail.com`) is automatically granted full Barista Admin privileges.
- Other Google accounts see a polite **Access Restricted — Pending Admin Approval** screen while their sign-in attempt appears in the admin's Sign-In Audit Logs.
