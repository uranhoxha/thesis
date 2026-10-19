# Thesis Talking Points

A working set of notes for the thesis defense / write-up. The project is a
Next.js cooking companion app that combines AI recipe generation, hands-free
voice control, and a personal recipe library on top of Supabase.

---

## 1. Project Overview

**What it is.** A web application that helps a home cook three ways:

1. **Plan** — keep a personal library of recipes and a buy list.
2. **Discover** — get three deterministic daily picks (savory / snack / dessert)
   and AI-generated recipes from whatever ingredients are on hand.
3. **Cook** — a hands-free voice mode that drives the timer and the buy list
   while the user's hands are dirty.

**Why these three.** The feature set was shaped around the actual workflow of
cooking at home: deciding what to make, sourcing ingredients, and following
through in the kitchen. Each surface targets one of those phases instead of
piling unrelated features into a generic "recipe app."

---

## 2. Technology Stack

### Front end

- **Next.js 16 (App Router)** with **React 19**. Route groups split the app
  into `(marketing)` for the public landing surface and `(pages)` for the
  authenticated product (`home`, `login`, `signup`, `share`, `admin`).
- **TypeScript** in strict mode; path alias `@/*` for clean imports.
- **Tailwind CSS v4** — no `tailwind.config.js`. Theme tokens live in
  `app/globals.css` under `@theme inline`, using the **OKLCH** color space for
  perceptually uniform colors.
- **shadcn/ui** ("new-york" preset) on top of **Radix UI** primitives, with
  **lucide-react** icons. `tw-animate-css` provides the animation utilities.
- **TanStack Query v5** for server-state caching, optimistic updates, and
  invalidation.
- **Outfit** as the display font (loaded via Google Fonts).

### Back end / data

- **Supabase** — Postgres + Auth + Realtime. The schema covers `recipes`,
  `buy_list_items`, `daily_picks`, and `cooking_tips`.
- **Three Supabase clients** with strict separation of concerns:
  - `lib/supabase/server.ts` — cookie-aware, used inside `'use server'`
    actions and route handlers.
  - `lib/supabase/browser.ts` — used by client components that subscribe to
    Realtime channels (e.g. the sidebar listens to `recipes` changes).
  - `lib/supabase/admin.ts` — service-role key, server-only, used for
    `auth.admin.*` operations (listing / deleting users).
- **Next.js Server Actions** are the only place that writes to Supabase. Every
  mutation revalidates the relevant path with `revalidatePath('/...')`.

### AI

- **Google Gemini 2.5 Flash** via `@google/genai`. Multimodal: accepts a
  base64-encoded image **and/or** a typed ingredient list, and returns
  structured JSON (`responseMimeType: 'application/json'`).
- A defensive JSON parser strips fenced code blocks before falling back, so
  the pipeline survives small format drift from the model.

### Browser platform APIs

- **Web Speech API** — `SpeechRecognition` for voice input, `speechSynthesis`
  for spoken confirmations. Vendor-prefixed (`webkitSpeechRecognition`)
  fallback.
- **Wake Lock API** — keeps the screen on while voice mode is active so the
  user does not lose the session mid-recipe.
- **lz-string** — compresses recipe payloads into shareable URLs without a
  backend round-trip.

### Tooling

- ESLint via `eslint-config-next` with TypeScript rules enabled.
- No test runner is configured (a candid limitation; see §7).

---

## 3. Architecture

### Feature-folder layout

The codebase is organized by feature, not by technical layer. Every feature
under `features/<name>/` has the same shape:

```
features/<feature>/
  api/         server actions ('use server') — only place that talks to Supabase
  components/  React components
  hooks/       client hooks (useQuery / useMutation wrappers)
  types/       shared TS interfaces
  providers/   React context (when the feature needs cross-tree state)
```

Routes under `app/` only compose feature components — there is **no business
logic in the route layer**. This makes features moveable, testable in
isolation, and keeps the App Router files small.

Existing features: `admin`, `auth`, `buy-list`, `chef-bot`, `home`,
`pantry-scan`, `profile`, `recipes`, `settings`, `timer`, `voice`.

### Data-flow pattern

Server actions perform the DB call and revalidate the cache. Client components
consume them through TanStack Query hooks that implement **optimistic updates
with rollback**:

```
onMutate   → cancel outstanding queries, snapshot state, optimistically
             apply the change
onError    → restore the snapshot
onSettled  → invalidate the query so the next fetch is authoritative
```

`features/buy-list/hooks/use-buy-list.ts` is the canonical reference; the
voice provider and other mutations follow the same pattern.

### Auth and route protection

- **Edge middleware** (`middleware.ts`) gates `/` and `/home/:path*`. Signed-in
  users on `/` are redirected to `/home`; anonymous users on `/home/*` go to
  `/login`.
- **Admin routes are explicitly excluded from the matcher.** Each admin server
  action calls `checkIsAdmin()`, which compares the user's email against a
  comma-separated `ADMIN_EMAILS` env var. The trade-off: per-action checks
  give finer-grained control but require discipline (every action must gate
  itself — there is no shared layout guard).
- OAuth and magic-link callbacks land at `/auth/callback`, which exchanges the
  code and redirects to `/home`.

---

## 4. Key Features

### 4.1 Pantry Scan (multimodal AI)

**Where:** `features/pantry-scan/api/scan.ts`

The user can either snap a photo of their fridge / counter / pantry **or**
type a list of ingredients (or both — the prompt accepts both modalities in a
single request). Gemini 2.5 Flash returns a strict JSON envelope:

```json
{
  "ingredients": ["..."],
  "recipes": [
    { "title": "...", "content": "Markdown with Ingredients + Steps" },
    ...
  ]
}
```

The system prompt enforces three meaningfully different recipes (e.g. across
cuisines or quick / medium / elaborate), so the user always gets options
rather than three near-duplicates. The action requires an authenticated user
before calling the model — the API key never reaches the client.

**Talking points:**
- Multimodal prompting (image + text in the same request).
- Schema-constrained output via `responseMimeType: 'application/json'`,
  with a permissive fallback parser to handle code-fenced responses.
- Server action pattern protects the API key and authenticates the caller.

### 4.2 Voice mode (hands-free cooking)

**Where:** `features/voice/`

A `VoiceProvider` orchestrates three browser APIs:

- `useVoiceRecognition` — wraps `SpeechRecognition` with a typed interface
  and graceful error messaging (e.g. "Speech service unreachable — on Linux
  Chromium this often fails").
- `useSpeechSynthesis` — speaks back confirmations ("Timer started", "Paused").
- `useWakeLock` — keeps the screen awake while listening.

The transcript is fed into `parseCommand`, a hand-written intent parser that
recognizes:

- Timer commands: *"set a timer for ten minutes"*, *"start"*, *"pause"*,
  *"reset"*, *"switch to stopwatch"*.
- Buy-list commands: *"add eggs to my list"*, *"remove milk"*,
  *"check off bread"*, *"what's on my list"*.
- Voice toggle: *"stop listening"*, *"voice off"*.

**Why a regex parser instead of an LLM?** Latency, cost, and offline
predictability. Cooking commands are a small grammar; sending each utterance
to a model would add a round-trip delay and an API bill for no benefit.

**Talking points:**
- Cross-cutting browser APIs (speech, wake lock) coordinated through a single
  provider.
- Deterministic intent parsing chosen over LLM intent recognition for
  latency and reliability.
- Direct integration with the timer and buy-list features through their
  existing actions — voice is a thin shell over the same code paths the UI
  uses.

### 4.3 ChefBot daily picks

**Where:** `features/chef-bot/api/daily-picks.ts`

Three picks per day — one savory, one snack, one dessert — selected
deterministically by hashing the date string (`YYYY-M-D`) and using a
`Math.sin`-based PRNG seeded with the hash plus a per-category salt. **Every
user sees the same picks on the same day**, so picks are cacheable, stable,
and shareable in conversation ("did you see today's dessert?") without any
server-side scheduling.

**Talking points:**
- Server-free daily rotation via deterministic hashing — no cron, no
  background job.
- Trade-off: rotation needs a populated `daily_picks` table (curated by
  admins).

### 4.4 Recipe sharing via compressed URLs

**Where:** `features/home/hooks/use-recipe.ts` (`handleShare`),
`app/(pages)/share/page.tsx`

Recipes are encoded with `lz-string`'s `compressToEncodedURIComponent` and
embedded directly in a `/share?data=...` URL. The recipient's app
decompresses and renders the recipe; if they are signed in, they can save it
to their own library with a single call to `createRecipe()`.

**Talking points:**
- Zero-backend sharing — the URL *is* the payload.
- Avoids a "shares" table and the GDPR overhead of storing user content
  destined for third parties.

### 4.5 Buy list with optimistic UI

**Where:** `features/buy-list/`

Add / toggle / delete all use the optimistic-update pattern (snapshot →
mutate cache → rollback on error → invalidate on settle). The UI feels
instantaneous even on a slow network because the local cache is the source of
truth until the server responds.

### 4.6 Cooking timer

**Where:** `features/timer/`

Stopwatch and countdown modes, exposed as a context (`TimerProvider`) so the
voice layer and the UI can both drive it without prop-drilling.

### 4.7 Admin dashboard

**Where:** `features/admin/`

Curates `daily_picks` and `cooking_tips`, manages users (list / delete via
`auth.admin`). Uses the **service-role Supabase client**, which is **strictly
server-only** — it never appears in a `'use client'` file. Every action is
gated by `checkIsAdmin()`.

---

## 5. Design System

- **Tailwind v4 with CSS-first tokens.** Theme variables are declared in
  `app/globals.css` under `@theme inline`, eliminating the JavaScript config
  file. This keeps the design system co-located with the styles and avoids a
  second source of truth.
- **OKLCH color space** for all tokens. OKLCH is perceptually uniform —
  lightness changes look like equal lightness changes to the eye, which is
  why the same `--brand` token works across light-on-dark and dark-on-light
  contexts without manual tweaking.
- **Four user-selectable themes** (`green` default, `red`, `blue`, `yellow`).
  Implemented as classes on `<html>` (`theme-red`, `theme-blue`,
  `theme-yellow`); green is the unclassed default. Persisted in
  `localStorage` under `app-theme` and managed by `useTheme` /
  `ThemeProvider`. The sidebar logo swaps based on the active theme to keep
  brand identity consistent.
- **shadcn/ui ("new-york")** gives a coherent baseline (button, card, dialog,
  popover, sheet, table, etc.) over Radix primitives. Custom components live
  next to the features that use them; only generic primitives sit in
  `components/ui`.
- `cn()` from `lib/utils.ts` (clsx + tailwind-merge) is the standard class
  composer.

**Talking points:**
- Why CSS-first tokens in Tailwind v4: simpler mental model, no build-time
  config, faster theming.
- Why OKLCH: perceptual uniformity, predictable contrast.
- Why class-based theming over a CSS variables hot-swap: the cascade
  guarantees consistency, no FOUC, and themes can override any token cleanly.

---

## 6. Notable Engineering Decisions

| Decision | Why |
| --- | --- |
| Server Actions for all writes | Single auth boundary; secrets never reach the client; built-in cache revalidation. |
| TanStack Query for reads | Optimistic UI without writing reducers; built-in retry / dedupe / window-focus refetch. |
| Three Supabase clients | Enforces the boundary between cookie-scoped user requests, public realtime, and privileged admin work. |
| Regex command parser | Lower latency and zero per-utterance cost vs. LLM-based intent classification. |
| Deterministic daily picks | No scheduler, no caching layer — same picks for everyone, derivable from the date alone. |
| Per-action admin gating (no layout guard) | Defense in depth: every privileged action is responsible for its own check, so refactors cannot accidentally drop the guard. |
| Compressed share URLs | No "shares" table, no orphaned rows, no privacy review for stored shared content. |

---

## 7. Limitations and Future Work

- **No automated test suite.** Notable gap. Realistic next step: Playwright
  for the auth flow, voice command parsing unit tests (the parser is a pure
  function), and Supabase test database for server actions.
- **Web Speech API has uneven cross-browser support.** Chromium on Linux
  often fails with `network` errors. The UI surfaces a useful message, but a
  Whisper-based fallback (server-side transcription) is a candidate
  improvement.
- **Gemini calls are not cached.** Two users with the same fridge contents
  would each pay for a generation. A content-hash cache on the server action
  would cut cost and latency.
- **Admin authorization is email-based.** Adequate for a small project but
  doesn't scale; a `roles` table in Supabase with RLS would be the
  production-grade answer.
- **No rate limiting** on the AI endpoint. Required before any public
  release.
- **`daily_picks` curation is manual.** Could be seeded from an LLM batch
  job, with admin review.

---

## 8. Headline Numbers / Quick Reference

- 11 feature folders, each self-contained.
- 4 user themes, all defined in CSS without a JS theme config.
- 3 Supabase clients with disjoint responsibilities.
- 3 daily picks, deterministic per date.
- 3 recipes returned per pantry scan, by design.
- 1 multimodal model (Gemini 2.5 Flash) for vision + recipe generation.

---

## 9. Demo Script (suggested order for the defense)

1. **Sign in** — show the OAuth / magic-link callback flow and middleware
   redirect.
2. **Home** — daily picks, sidebar Realtime updates as a recipe is added.
3. **Pantry scan** — upload a fridge photo, walk through the JSON response and
   the three returned recipes.
4. **Save a recipe** from the scan result; show optimistic update.
5. **Voice mode** — set a timer, add an item to the buy list, ask "what's on
   my list?", say "voice off."
6. **Share** — generate a `/share?data=...` URL, open it in a private window,
   save it to that account.
7. **Theme switch** — cycle through the four themes; note the logo swap.
8. **Admin** — show the dashboard, point out `checkIsAdmin()` in
   `features/admin/actions.ts`.
