# Thesis Handbook — Talking Points

A condensed reference of titles, subtitles, and the key talking points for each
chapter. Built to be read at a glance during writing and defense. Deeper detail
lives in `THESIS_NOTES.md`, `presentation-data.md`, and `proposal-section-b.md`.

**Project:** An AI-powered, voice-enabled cooking companion — a multimodal web
app that helps the home cook **plan**, **discover**, and **cook**.
**Stack:** Next.js 16 · React 19 · TypeScript strict · Supabase · Google Gemini 2.5 Flash.

---

## 1. Introduction

### 1.1 The Problem
- Cooking is touch-hostile — wet, sticky, full hands fight with a touchscreen.
- The workflow is fragmented: recipes in one app, shopping list in another, timer on the stove.
- AI recipe tools take *text only* — they ignore what's actually in the fridge.

### 1.2 Why It Matters Now
- 30–40% of household food is wasted; "cook what I already have" cuts that.
- Multimodal AI (Gemini, GPT-4o) is finally cheap/fast enough for per-request features.
- Smart-kitchen UX is locked to proprietary hardware (Alexa, Google Home) — the browser isn't.

### 1.3 Motivation
- Unify plan → discover → cook into one coherent web surface, no native install.

---

## 2. Research Objective

### 2.1 Main Goals
- Ship a production-grade web app spanning the full home-cooking workflow.
- Treat multimodal AI (image + text → structured JSON) as a first-class feature, not a demo.
- Build a hands-free voice layer using only browser APIs.
- Validate a reusable feature-folder architecture for mid-sized Next.js apps.

### 2.2 Research Questions
- Can one web stack deliver multimodal AI + realtime sync + voice without a custom backend?
- What patterns keep a feature-rich Next.js app maintainable as features multiply?
- When should you choose deterministic logic over an LLM for command interpretation?
- How do server actions enforce a clean client / user-data / admin security boundary?

### 2.3 Measurable Objectives
- Pantry Scan returns exactly 3 distinct recipes, 100% of the time.
- Voice parser handles ≥10 intents deterministically, ~0 per-request AI cost, <10ms parse.
- Daily picks identical for all users on the same date (deterministic hash).
- Optimistic-UI rollback reliable under simulated network failure.

---

## 3. Background / Existing Solutions

### 3.1 The Landscape
- **Recipe libraries** (Yummly, Paprika): text search, manual entry, no image AI.
- **Pantry-to-recipe** (SuperCook, MyFridgeFood): rule-based match on a *static* DB.
- **Generic AI chat** (ChatGPT, Gemini): conversational, but no kitchen UX, no voice/timer.
- **Voice assistants** (Alexa, Google): tied to hardware, can't reach app state.

### 3.2 Gaps This Project Fills
- **Vision** — just *show* the fridge instead of typing.
- **Voice that controls real state** — not just "set a timer," but add/query the buy list.
- **Deterministic daily picks** — same for everyone, no scheduler.
- **Zero-backend sharing** — the URL *is* the recipe.

---

## 4. Methodology / Architecture

### 4.1 Feature-Folder Architecture
- Organized by feature, not technical layer: `features/<name>/{api,components,hooks,types,providers}`.
- `app/` holds thin route files only — **no business logic in the route layer**.
- 11 self-contained features; a new capability drops in without touching the others.

### 4.2 Data-Flow Pattern
- Server Actions (`'use server'`) are the **only** place that writes to Supabase.
- Every mutation calls `revalidatePath('/...')`; clients consume via TanStack Query hooks.
- **Optimistic update:** onMutate (cancel → snapshot → set cache) → onError rollback → onSettled invalidate.
- Canonical reference: `features/buy-list/hooks/use-buy-list.ts`.

### 4.3 Three Supabase Clients (security by design)
- `server.ts` — cookie-aware, for server actions / route handlers.
- `browser.ts` — for realtime subscribers (sidebar listens to `recipes` changes).
- `admin.ts` — service-role key, **server-only**, for `auth.admin.*` ops.
- Lesson: *make the dangerous client visibly dangerous* — by name and by location.

### 4.4 Auth & Route Protection
- Edge middleware gates `/` and `/home/:path*` (redirect signed-in/anonymous accordingly).
- **Admin routes excluded from the matcher** — each action calls `checkIsAdmin()` (email vs. `ADMIN_EMAILS`).
- Per-action gating = defense in depth; refactors can't drop a shared layout guard.
- OAuth / magic-link → `/auth/callback` exchanges code → `/home`.

### 4.5 AI Integration
- Google Gemini 2.5 Flash via `@google/genai`, multimodal: image **and/or** typed ingredients in one call.
- Schema-constrained: `responseMimeType: 'application/json'` + strict system prompt → `{ ingredients[], recipes[3] }`.
- Defensive parser: try `JSON.parse`, then strip code fences, then validate shape.
- API key read only inside an authenticated server action — never in the client bundle.

---

## 5. Key Features

### 5.1 Pantry Scan (multimodal AI)
- Photo and/or ingredient text → 3 *meaningfully different* recipes (cuisine / quick-to-elaborate).
- Auth-gated server action protects the key and the model call.

### 5.2 Voice Mode (hands-free cooking)
- `VoiceProvider` orchestrates Web Speech (recognition + synthesis) + Wake Lock.
- Hand-written `parseCommand` intent parser: timer + buy-list + voice-toggle commands.
- **Regex over LLM** — latency, cost, offline predictability; commands are a small closed grammar.

### 5.3 ChefBot Daily Picks
- 3 picks/day (savory/snack/dessert) chosen by hashing `YYYY-M-D` + per-category salt + `Math.sin` PRNG.
- Same picks for everyone, no cron, no cache layer — *determinism eliminates state*.

### 5.4 Recipe Sharing (compressed URLs)
- `lz-string` packs the recipe into `/share?data=...`; recipient decompresses and one-click saves.
- No shares table, no orphaned rows, reduced GDPR exposure.

### 5.5 Buy List & Timer
- Buy list: optimistic add/toggle/delete — instant feel even on slow networks.
- Timer: stopwatch + countdown via `TimerProvider`, drivable by both UI and voice.

### 5.6 Admin Dashboard
- Curates `daily_picks` + `cooking_tips`, manages users via service-role client.
- Every action gated by `checkIsAdmin()`.

---

## 6. Design System

### 6.1 Tailwind v4, CSS-First
- Theme tokens in `app/globals.css` under `@theme inline` — no `tailwind.config.js`.
- **OKLCH** color space → perceptually uniform, consistent contrast across themes.

### 6.2 Four Themes
- `green` (default) + `red`/`blue`/`yellow` as classes on `<html>`, persisted in `localStorage`.
- Class-based theming over variable hot-swap: leverages the cascade, no FOUC; logo swaps per theme.

---

## 7. Engineering Decisions (defensible trade-offs)

- **Server Actions for all writes** — one auth boundary, secrets stay server-side, built-in revalidation.
- **TanStack Query for reads** — optimistic UI, retries, refetch-on-focus, no hand-rolled reducers.
- **Three Supabase clients** — enforce the cookie / realtime / admin boundary.
- **Regex command parser** — lower latency, zero per-utterance cost vs. LLM intent classification.
- **Deterministic daily picks** — no scheduler, derivable from the date alone.
- **Per-action admin gating** — survives refactors better than a single layout guard.
- **Compressed share URLs** — no storage table, no privacy review for shared content.

---

## 8. Challenges & Lessons

- **Gemini JSON drift** → defensive parse + shape validation. *Treat LLM output as advisory.*
- **Web Speech fragility** (Linux Chromium `network` errors) → typed wrapper with actionable errors. *"Standard" APIs still need feature detection.*
- **Voice latency vs. cost** → deterministic parser. *Use determinism when the grammar is closed and small.*
- **Realtime vs. optimistic UI race** → invalidate-on-settled; server wins on commit. *Cache is truth only between onMutate and onSettled.*

---

## 9. Innovation / Unique Value

- One web stack, full workflow — no companion app, no proprietary hardware.
- Multimodal AI as a real feature: photo + text, strict JSON, defensive parser.
- Browser-native voice that controls real app state.
- Deterministic daily content with zero infrastructure.
- A reproducible feature template that survives the next ten capabilities.

---

## 10. Limitations & Future Work

### 10.1 Limitations
- No automated test suite (highest-priority gap).
- Web Speech API uneven across browsers; no rate limiting on the AI endpoint.
- Gemini calls uncached — duplicate inputs re-bill; admin auth is email-based.

### 10.2 Future Work
- **Short-term:** Playwright + parser unit tests, AI rate limiting, content-hash cache, Whisper fallback, Supabase roles table + RLS.
- **Long-term:** personalization (diet/allergies in prompt), PWA + offline, multi-language voice, grocery-delivery integration, collaborative household buy lists.

---

## 11. Conclusion

- A production-grade web app uniting multimodal AI, realtime sync, and browser-native voice across the full cooking workflow.
- Demonstrates the modern web stack is ready for AI-first, hands-free, real-time experiences without native binaries.
- Delivers a reusable architectural template and a documented set of engineering trade-offs.

> *"A single modern web application can be the kitchen of the future — and the platform we already have is enough to build it."*

---

## Quick Reference (headline numbers)

- 11 self-contained feature folders · 3 Supabase clients · 4 themes (0 JS config)
- 3 recipes per pantry scan · 3 deterministic daily picks · ~10 voice intents (<10ms, regex)
- 1 multimodal model (Gemini 2.5 Flash) for vision + recipe generation
