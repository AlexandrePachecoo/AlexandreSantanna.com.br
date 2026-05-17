# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Carta Virtual de Dia das Mães** is a landing page for WLG Distribuidora that lets customers create a personalized virtual letter (carta) for Mother's Day. The product flow:

1. User writes a message (up to 2000 chars).
2. Uploads up to 10 photos.
3. Picks a favorite Spotify track (server-side Spotify Web API search).
4. Pays via PIX (AbacatePay).
5. On payment confirmation (webhook), the carta is **publicada** — accessible via `https://<host>/c/<slug>`.
6. The success page surfaces the link, a downloadable QR Code, and a WhatsApp share button.

The static site is served as plain HTML/CSS/JS; Vercel Functions in `api/` handle the backend.

## Stack

- **Static frontend**: HTML/CSS/Vanilla JS (no build step).
- **Backend**: Vercel Functions (Node, ESM) in `api/`.
- **DB + Storage**: Supabase (`cartas` table, `fotos-pedidos` bucket).
- **Payment**: AbacatePay (PIX). Customer fills CPF/phone in AbacatePay checkout.
- **Spotify**: Client Credentials flow on the server, in-memory token cache.
- **QR Code**: `qrcode` npm package (PNG/SVG output).

## Running Locally

```bash
# Static only (no API):
python3 -m http.server 8000

# Full (API + static): requires Vercel CLI + .env populated
npm install
npm run dev   # vercel dev
```

## File Structure

- `index.html` — landing page with the carta-creation form.
- `carta.html` — public viewer for `/c/:slug` (rewritten by `vercel.json`).
- `sucesso.html` — post-checkout page that polls until carta is `publicada` and surfaces link/QR/WhatsApp.
- `styles.css` — design system + Spotify picker, share box, carta viewer styles.
- `script.js` — countdown, drag-drop upload, image compression, Spotify search (debounced), form submit.
- `api/carta.js` — create carta + AbacatePay billing.
- `api/carta-publica.js` — public read (returns data only when `status='publicada'`).
- `api/spotify-search.js` — Spotify track search (Client Credentials token cached).
- `api/qrcode.js` — server-side QR code for `https://<host>/c/<slug>` (PNG or SVG).
- `api/upload-urls.js` — signed Supabase upload URLs (up to 10 files).
- `api/webhook.js` — AbacatePay webhook → marks carta as `publicada`.
- `server/db.js` — Supabase CRUD for `cartas`.
- `server/services/carta.js` — orchestrates DB insert + AbacatePay charge creation.
- `server/services/spotify.js` — Spotify token cache + search.
- `server/services/pagamento.js` — AbacatePay charge creation + webhook secret validation.
- `server/services/storage.js` — Supabase storage helpers.
- `supabase/migrations/0002_cartas.sql` — `cartas` table schema.

## Data Model

`cartas` table:
- `slug` (unique, short base64url) — the public identifier in `/c/:slug`.
- `nome_destinatario`, `nome_remetente`, `idade`, `texto`, `email`.
- `fotos_paths` (text[]) — Supabase storage keys; signed URLs generated at read time.
- `spotify_track_id`, `spotify_track_name`, `spotify_artist`, `spotify_album_art`.
- `status`: `pendente_pagamento` → `publicada`.
- `charge_id` — AbacatePay charge id (used as webhook fallback).

## Required Env Vars

```
FRONTEND_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
ABACATEPAY_API_KEY=
ABACATEPAY_WEBHOOK_SECRET=
PRODUCT_PRICE=1500
```

## Key Patterns

- IIFE in `script.js`, null-safe DOM queries.
- Design tokens in `:root` (rose palette + cream + ink).
- Form: client-side compression (canvas, 1600px, 0.85 JPEG) → signed-URL upload → `/api/carta` → AbacatePay checkout.
- Webhook is idempotent (skips if already `publicada`).
- Spotify token cached in module-level variable (Vercel warm starts reuse it).
