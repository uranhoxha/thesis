# Thesis Title

**Working title:** *AI-Powered Cooking Companion — A Multimodal, Voice-Enabled Web Application for Home Cooks*

**Subtitle:** Combining Google Gemini multimodal AI, Web Speech APIs, and Supabase Realtime in a feature-modular Next.js 16 architecture.

---

# Project Overview

- A full-stack web application that supports the home cook across three distinct phases of cooking: **plan**, **discover**, and **cook**.
- Built on **Next.js 16 (App Router)** with **React 19**, **TypeScript strict**, **Supabase** (Postgres + Auth + Realtime), and **Google Gemini 2.5 Flash** for multimodal AI.
- **Target users:** everyday home cooks who want help deciding what to make, tracking what to buy, and following recipes hands-free.
- **Core functionality:**
  - Personal recipe library with optimistic updates and Realtime sync.
  - Shoppable buy list driven by both UI and voice.
  - **Pantry Scan**: send a photo *and/or* typed ingredient list to Gemini and receive three meaningfully different recipes back.
  - **ChefBot daily picks**: three deterministic picks per day (savory / snack / dessert), identical for every user.
  - **Voice mode**: hands-free timer + buy-list control via Web Speech API, with screen wake lock.
  - **Recipe sharing** as compressed URLs with no backend storage.
  - **Admin dashboard** for curating daily picks, cooking tips, and managing users.

---

# 1. Introduction to the Problem

## The problem

- Home cooks face decision fatigue, food waste, and clumsy hands-free UX every day.
- Existing cooking apps fragment the workflow: one app for recipes, another for shopping lists, another for timers, and almost none designed for a kitchen environment where the user's hands are wet, sticky, or full.
- AI recipe generators usually take *text only*, ignoring what the user actually has in their fridge right now.

## Why it matters today

- 30–40% of food in households goes to waste; better suggestions for "what to make with what I already have" directly reduces that.
- Smart-kitchen interest is rising, but most assistants are tied to proprietary hardware (Alexa, Google Home) rather than a plain browser.
- Multimodal AI models (Gemini, GPT-4o) have only recently become cheap and fast enough to make image-based ingredient detection viable as a per-request product feature.

## Who is affected

- Solo home cooks and busy households planning weeknight meals.
- Beginner cooks lacking confidence to improvise from pantry contents.
- Users with accessibility needs who benefit from voice-driven kitchen UX.

## Motivation

- Build one coherent surface that covers the full cook-day workflow (plan → discover → cook) instead of three disconnected tools.
- Demonstrate that a modern web stack can deliver a hands-free, AI-powered kitchen experience without proprietary hardware.

## Talking points

- Cooking is one of the rare daily activities where touch input is actively bad UX.
- Multimodal AI finally makes "what can I cook with what I have?" a one-tap question.
- Web-only delivery removes the install barrier of native cooking assistants.
- This thesis closes the gap between fragmented recipe apps and integrated kitchen workflows.

## Presenter speech (short version)

> "Cooking at home is one of the most touch-hostile activities we still expect people to manage with a touch screen. Recipes live in one app, shopping lists in another, timers on the stove. At the same time, multimodal AI has just become fast and cheap enough that we can finally answer the right question — 'what can I cook with what I already have?' — from a single photo. This project is a web-first cooking companion that ties planning, discovery, and hands-free cooking into one continuous workflow, and demonstrates how to do it with today's web platform alone."

---

# 2. Research Objective

## Main goals

- Design and ship a production-grade web application that covers the full home-cooking workflow in a single coherent product.
- Integrate **multimodal generative AI** (image + text → structured JSON recipes) as a first-class product feature, not a demo.
- Engineer a **hands-free voice layer** using only browser APIs (no native app, no proprietary hardware).
- Validate a **feature-folder architecture** for medium-sized Next.js applications that scales without dragging in microservices.

## Research questions

1. Can a single modern web stack deliver multimodal AI, real-time data sync, and hands-free voice control without a custom backend?
2. What architectural patterns keep a feature-rich Next.js application maintainable as features multiply?
3. When should developers use deterministic logic vs. an LLM for command interpretation in a cost- and latency-sensitive UX?
4. How can server actions enforce a clean security boundary between client, user-scoped data, and admin-only operations?

## Expected outcomes

- A deployable Next.js application implementing all three workflow phases.
- A repeatable architectural template: `features/<name>/{api,components,hooks,types,providers}`.
- A documented set of engineering trade-offs (server actions vs. REST, regex vs. LLM, deterministic picks vs. cron).
- A demonstrable AI pipeline that survives schema drift via a permissive JSON parser.

## Measurable objectives

- **Cold load time** for the home page < 2s on a modest connection.
- **Optimistic UI** rollback works reliably under simulated network failure.
- **Pantry Scan** returns exactly 3 distinct recipes per request, 100% of the time, via schema-constrained JSON output.
- **Voice parser** handles ≥ 10 distinct intents deterministically with zero per-request AI cost.
- **Daily picks** identical across all users for the same calendar day (deterministic hash).

---

# 3. Background / Existing Solutions

## Similar systems / platforms

| System | Category | Notable trait |
| --- | --- | --- |
| Yummly, Paprika | Recipe library | Text search, manual entry, no image AI |
| SuperCook, MyFridgeFood | Pantry-to-recipe | Rule-based filtering on a static recipe database |
| Tasty, BBC Good Food | Discovery | Editorially curated; no personalization |
| ChatGPT / Gemini chat | Generic AI | Conversational; not a kitchen-ready UX, no voice/timer integration |
| Alexa / Google Assistant recipes | Voice + cook | Tied to proprietary hardware; opaque AI |

## Common approaches in this field

- **Text-only ingredient input** matched against curated recipe databases.
- **Editorial curation** of "recipe of the day" via human staff or basic cron jobs.
- **Generic voice assistants** that handle timers but cannot reach into the user's data (recipes, lists).
- **Native mobile apps** with offline storage, but no shared web surface.

## Weaknesses of existing solutions

- No vision: users can't simply *show* what's in the fridge.
- Voice support is bolt-on, not integral — usually limited to "set a timer."
- Personalization and "what do I have right now" coexist only inside proprietary ecosystems.
- Sharing recipes between users typically requires accounts on both sides and a stored shares table.
- Real-time multi-device sync is rare in cooking apps.

## Gaps this project fills

- **Multimodal AI scan** as a first-class feature.
- **Browser-only voice mode** that controls real app state (timer, buy list), not just confirmations.
- **Deterministic daily picks** — no scheduler, no fairness debate, identical across users by design.
- **Compressed share URLs** — zero-backend sharing.

## Why this project is different

- One web stack covers the full workflow; no native binary required.
- AI is structured (JSON envelope) and the API key never reaches the client.
- Voice intents use deterministic parsing — predictable latency, no per-utterance cost.
- The architecture is reproducible: any new feature drops into `features/<name>/` with the same five subfolders.

---

# 4. Methodology

## System Architecture

### Frontend

- **Next.js 16 App Router** with route groups: `(marketing)` (public landing) and `(pages)` (`home`, `login`, `signup`, `share`, `admin`).
- **React 19** with client components only where required (state, browser APIs); server components by default.
- **TanStack Query v5** owns all server state on the client; reducers are avoided.
- **shadcn/ui ("new-york")** primitives over **Radix UI**; **lucide-react** icons; **tw-animate-css** for animation utilities.
- **Tailwind v4** with CSS-first theme tokens in `app/globals.css` under `@theme inline` — no `tailwind.config.js`.
- **OKLCH color space** for all design tokens (perceptually uniform).
- **Four user themes** as classes on `<html>` (`theme-red`, `theme-blue`, `theme-yellow`; green = unclassed default), persisted in `localStorage`.

### Backend / data

- **Supabase** (Postgres + Auth + Realtime) provides DB, auth, and pub/sub.
- **Next.js Server Actions** are the only place that writes to Supabase; every mutation calls `revalidatePath('/...')`.
- **Three Supabase clients** with strict separation:
  - `lib/supabase/server.ts` — cookie-aware, used in `'use server'` files.
  - `lib/supabase/browser.ts` — used by Realtime subscribers (e.g. sidebar listens for `recipes` changes).
  - `lib/supabase/admin.ts` — service-role key, server-only, used in `features/admin/actions.ts`.

### Data flow

```
Client component
   ↓ useQuery / useMutation (TanStack Query)
Server Action ('use server')
   ↓ supabase.from(...).insert/update/delete
revalidatePath('/...')        ← cache invalidation
   ↓
Realtime channel (browser client) → UI updates
```

- **Optimistic update pattern**: `onMutate` → cancel queries → snapshot → set cache → `onError` rollback → `onSettled` invalidate. Canonical example: `features/buy-list/hooks/use-buy-list.ts`.

### Authentication

- **Edge middleware** (`middleware.ts`) matches `/` and `/home/:path*`.
- Signed-in user on `/` → redirect to `/home`.
- Unauthenticated user on `/home/*` → redirect to `/login`.
- **Admin routes deliberately excluded from the matcher** — each admin server action calls `checkIsAdmin()` (compares `user.email` against `ADMIN_EMAILS` env var). Per-action gating is defense-in-depth: refactors cannot accidentally drop a layout guard.
- OAuth / magic-link callback → `/auth/callback` exchanges the code and redirects to `/home`.

### State management

- Client state: lightweight React context where features need cross-tree state (`TimerProvider`, `VoiceProvider`, `ThemeProvider`).
- Server state: TanStack Query, always — never duplicated into context.
- Persistent client state: `localStorage` for theme and last-known timer values.

### APIs

- Server Actions (`'use server'`) — the only mutation surface.
- `/auth/callback` route handler for the OAuth/magic-link code exchange.
- No REST or tRPC layer — server actions replace both.

### AI integration

- **Google Gemini 2.5 Flash** via `@google/genai`.
- **Multimodal**: a single request accepts a base64-encoded image *and/or* a typed ingredient list.
- **Schema-constrained output**: `responseMimeType: 'application/json'` plus a strict system prompt enforcing the envelope `{ ingredients[], recipes[3] }`.
- **Defensive JSON parser**: strips fenced code blocks (\`\`\`json ... \`\`\`) before retry — survives small format drift from the model.
- **API key isolation**: the server action reads `GOOGLE_GENERATIVE_AI_API_KEY` from the environment; it never touches the client bundle.

### Deployment

- Designed for **Vercel** (zero-config Next.js deployment) with **Supabase Cloud**.
- Edge middleware runs on Vercel's edge runtime; server actions run as serverless functions.

## Technologies Used

| Technology | Why chosen | Benefit | Trade-off |
| --- | --- | --- | --- |
| Next.js 16 App Router | Server components + server actions cut boilerplate | Single mutation surface, built-in cache revalidation | Bleeding edge (16.x); some libraries still catching up |
| React 19 | Aligns with Next 16; richer transitions | Modern hooks, automatic batching | Compatibility risk with older Radix versions |
| TypeScript strict | Catches refactor regressions at compile time | Confidence to evolve a feature-folder structure | Some shape definitions feel duplicated |
| Tailwind v4 | CSS-first design tokens, no JS config | Co-located styles + design system | Less ecosystem tooling than v3 |
| OKLCH colors | Perceptually uniform | Tokens read consistently across themes | Less broadly understood by collaborators |
| shadcn/ui + Radix | Owned, copyable primitives over accessible base | Predictable a11y, customizable in-repo | More files to maintain than a single component library |
| TanStack Query v5 | Best-in-class server-state cache | Optimistic UI, retries, refocus refetch | Pattern compliance required |
| Supabase | Postgres + Auth + Realtime in one product | Saves writing an auth service from scratch | Vendor coupling |
| Google Gemini 2.5 Flash | Multimodal, fast, cheap | Image + text in one call, JSON output | Format drift handled by fallback parser |
| Web Speech API | Native, no extra dependencies | Zero install, zero AI cost | Uneven cross-browser support (Linux Chromium often errors) |
| Wake Lock API | Keeps screen on during voice mode | Session survives mid-recipe | Limited browser support outside Chromium |
| lz-string | Compresses recipes into shareable URLs | Zero-backend sharing, no shares table | URLs grow with recipe length |
| Outfit (Google Fonts) | Display font matching the brand | One-file include via `next/font` | Adds a Google network dependency |
| ESLint (`eslint-config-next`) | Standard Next + TS rules | Catches Next-specific anti-patterns | Mild perf cost in CI |

## Development Methodology

- **Feature-folder architecture**: every feature is self-contained (`api/`, `components/`, `hooks/`, `types/`, `providers/`). No business logic lives under `app/`.
- **Component-based UI design**: shadcn primitives in `components/ui`, feature-specific composites in `features/<name>/components`.
- **Server-action-first**: writes are always server actions; client code never reaches Supabase for mutations.
- **Incremental delivery**: commit history shows feature-by-feature progression (auth → recipes → buy list → voice → AI scan → admin → theming).
- **Scalability**: feature folders can be extracted into separate packages or even microfrontends without rewiring imports — they already have a single public boundary (`api/`).
- **Performance**: optimistic UI hides round-trip latency; server components reduce JS shipped; Realtime cuts polling.
- **Conventional commits**: `feat:`, `fix:` prefixes in git history.

---

# 5. Challenges During Development

## Multimodal JSON drift from Gemini

- **Problem:** Gemini occasionally wraps JSON in markdown code fences despite `responseMimeType: 'application/json'`.
- **Why:** LLM output is statistical; formatting hints are non-binding.
- **Solution:** Defensive parser — try `JSON.parse(text)` first, then strip ` ```json ` / ` ``` ` and retry, then validate shape (`ingredients[]`, `recipes[]`).
- **Lesson:** Treat structured LLM output as advisory and always validate before downstream use.

## Web Speech API cross-browser fragility

- **Problem:** Speech recognition fails with `network` errors on Linux Chromium; Safari support is partial.
- **Why:** The API depends on a vendor-provided cloud transcription service that varies per platform.
- **Solution:** Typed wrapper hook surfaces actionable error messages ("Speech service unreachable…") rather than silent failure. Wake Lock acquisition is also guarded.
- **Lesson:** Browser APIs labeled "standard" still need feature-detection and graceful UX fallbacks.

## Voice-intent recognition latency vs. cost

- **Problem:** Sending every utterance to an LLM adds 500–2000ms latency and a per-call bill.
- **Why:** Cooking commands are tiny (set timer, add item, check off) — a small grammar.
- **Solution:** Hand-written regex-based `parseCommand` covers ~10 intents deterministically with zero AI cost and predictable response.
- **Lesson:** Pick deterministic logic when the grammar is closed and small; reserve LLMs for open-ended language.

## Three Supabase clients without leaking the service role

- **Problem:** A single global client risked exposing the service-role key to the browser.
- **Why:** Service role bypasses RLS; leaking it is a critical security incident.
- **Solution:** Three explicit clients (`server`, `browser`, `admin`) with strict naming; `admin` is only imported from `'use server'` files in `features/admin/`.
- **Lesson:** Make the dangerous client visibly dangerous — by name and by location.

## Admin authorization without a roles table

- **Problem:** Production-grade RBAC was out of scope, but admin pages still needed gating.
- **Why:** Small project; building a full role system would have delayed shipping.
- **Solution:** Per-action `checkIsAdmin()` that compares email against `ADMIN_EMAILS` env var. Explicitly *not* a layout guard — every action gates itself.
- **Lesson:** Defense in depth beats single-point gates; per-action checks survive refactors.

## Deterministic daily picks without a cron job

- **Problem:** Wanted three rotating picks per day, identical across users, without server-side scheduling.
- **Why:** A cron job is overkill and a moving-target failure surface.
- **Solution:** Hash the date string `YYYY-M-D` and use a `Math.sin`-based PRNG, salted per category. Same picks for everyone on a given day.
- **Lesson:** Determinism eliminates state — every cached invariant is a feature.

## Realtime sync vs. optimistic UI

- **Problem:** Realtime updates from Supabase could overwrite an in-flight optimistic mutation.
- **Why:** Two writers (the user's own optimistic patch + the server's broadcast) racing.
- **Solution:** TanStack Query's invalidate-on-settled ensures the server's view wins on commit, while the snapshot/rollback path covers errors before settlement.
- **Lesson:** Treat the cache as the source of truth only between `onMutate` and `onSettled` — outside that window, the server is authoritative.

## Tailwind v4 with no JS config

- **Problem:** Existing tooling assumes `tailwind.config.js`; v4 uses CSS-first tokens.
- **Why:** Tailwind v4 changed the configuration model.
- **Solution:** All tokens live in `app/globals.css` under `@theme inline`; design tokens use OKLCH for perceptual uniformity.
- **Lesson:** When a framework updates, lean into its new model rather than emulating the old one.

## Sharing recipes without a backend table

- **Problem:** Storing "shared recipes" rows brings GDPR overhead and orphaned data.
- **Why:** Shared content is intended for third parties — storing it duplicates responsibility.
- **Solution:** `lz-string`'s `compressToEncodedURIComponent` packs the recipe into the URL itself; `/share?data=...` decompresses on arrival.
- **Lesson:** The URL can *be* the payload when payloads are small and stateless.

---

# 6. Demonstration / Results

## What the system achieves

- A single web app covering plan, discover, and cook with no native install.
- Multimodal AI scan returning structured JSON with three differentiated recipes.
- Hands-free voice control for timer + buy list.
- Realtime UI sync across devices/tabs.
- Four switchable themes with localStorage persistence and a swapping brand logo.
- Zero-backend recipe sharing via compressed URLs.
- Admin dashboard for curating daily picks and cooking tips, plus user management.

## Core completed features

- **Auth**: email/password, magic link, Google OAuth, password and avatar updates.
- **Home dashboard**: ChefBot daily picks, recipe library, sidebar with Realtime updates.
- **Pantry Scan**: photo + ingredient list → 3 distinct recipes.
- **Buy list**: optimistic add/toggle/delete.
- **Cooking timer**: stopwatch + countdown, exposed via context.
- **Voice mode**: 10+ deterministic intents, screen wake lock, spoken confirmations.
- **Recipe sharing**: encoded URLs, one-click save for recipients.
- **Admin**: CRUD for daily picks and cooking tips, user list and deletion via `auth.admin`.
- **Themes**: four themes (green, red, blue, yellow) with brand logo swap.

## User workflows

1. Sign up / log in → land on `/home`.
2. Take a fridge photo → AI returns 3 recipes → save one to the library.
3. Add ingredients to buy list (UI or voice).
4. Start cooking → enable voice mode → set a timer hands-free.
5. Share a saved recipe via URL → recipient saves it to their own library.

## Technical achievements

- **One mutation surface**: all writes go through server actions with cache revalidation.
- **Multimodal AI** with strict JSON output and a fallback parser.
- **Deterministic daily content** without a scheduler.
- **Hands-free UX** built entirely on browser APIs.
- **Feature-folder architecture** scaling to 11 features without entanglement.

## Suggested metrics to show

- 11 feature folders, each self-contained.
- 3 Supabase clients with disjoint responsibilities.
- 4 themes, 0 JS config files for them.
- 3 recipes per pantry scan, by design.
- ~10 voice intents, parsed in < 5ms locally (regex).
- 1 multimodal model handling vision + text + JSON.

## Suggested screenshots

- Landing / marketing page.
- Login page with Google OAuth.
- Home with daily picks and sidebar.
- Pantry Scan dialog (camera input + ingredient field).
- Pantry Scan result with three recipes.
- Recipe detail view.
- Buy list with checked + unchecked items.
- Timer in countdown mode.
- Voice toggle in active state.
- Theme switcher dropdown.
- Admin dashboard.

## Suggested live demo flow

1. Sign in (show middleware redirect from `/`).
2. Home: daily picks + sidebar Realtime as you add a recipe in another tab.
3. Pantry Scan: upload a photo → walk through the JSON envelope → save one recipe.
4. Voice mode: set a timer, add an item, ask "what's on my list?" → toggle off by voice.
5. Share: generate `/share?data=...` URL → open in private window → save.
6. Theme cycle: green → red → blue → yellow (note logo swap).
7. Admin: open `features/admin/actions.ts`, highlight `checkIsAdmin()`.

---

# 7. Innovation / Unique Value

## What makes the project unique

- **One web stack, full workflow.** Plan + discover + cook in a single browser surface — no companion app, no proprietary hardware.
- **Multimodal AI as a real feature, not a demo.** Photo + text in one call; strict JSON envelope; defensive parser.
- **Browser-native voice that controls real app state.** Not "set a timer" alone — it adds to your buy list and queries it back.
- **Deterministic daily content without infrastructure.** Hashing the date eliminates a cron job, a queue, and a cache.
- **Zero-backend sharing.** URLs *are* the payload.
- **Feature-folder template** that drops in cleanly for every new capability — five subfolders, one entry point.

## Novel technical ideas

- Pairing schema-constrained Gemini output with a permissive fallback parser to survive minor format drift.
- Three Supabase clients with naming that makes the dangerous one visible.
- Regex command parsing chosen *against* the obvious LLM choice — based on latency, cost, and predictability.
- Class-based themes over CSS variable hot-swap to leverage the cascade and avoid FOUC.

## UX improvements

- Optimistic mutations make the app feel instant even on slow connections.
- Wake lock during voice mode prevents the screen from sleeping mid-recipe.
- Spoken confirmations close the feedback loop without forcing the user to look.
- Real-time sidebar reflects library updates without manual refresh.

## Value propositions (presentation-ready)

- *"From fridge photo to cookable recipe in a single tap, no install required."*
- *"Hands-free cooking on any modern browser — no Alexa, no Google Home."*
- *"Three daily picks, identical for everyone, with no cron job in sight."*
- *"Sharing without storage — the URL is the recipe."*
- *"A reproducible feature template that survives the next ten capabilities."*

---

# 8. Real-World Applications

## Industries

- **Consumer cooking / food media** — daily-pick rotation, recipe libraries, shareable content.
- **Education** — voice-first cooking lessons; accessible UX patterns for culinary curricula.
- **Healthcare / nutrition** — pantry-scan as the front end for personalized dietary guidance.
- **Smart kitchens / IoT** — a browser surface for any connected appliance vendor.
- **Hospitality** — staff-facing pantry-to-menu suggestions during prep.
- **Retail / grocery** — buy-list integration with delivery APIs.
- **Accessibility tooling** — voice mode generalizes to other touch-hostile contexts (industrial, medical).

## Daily-user scenarios

- Solo cook deciding dinner from what's already in the fridge.
- Family meal planner curating a weekly buy list.
- Beginner learning by following daily picks.
- Cook with mobility/accessibility needs using voice mode.

## Potential market relevance

- Multimodal AI APIs are now cheap enough to make per-request product features viable.
- Web-first delivery sidesteps app-store friction and works on any device.
- Architecture extends to adjacent verticals (fitness, gardening, DIY) by swapping the AI prompt and database schema.

## Scalability opportunities

- Add per-user dietary preferences as a context block in the AI prompt.
- Layer a delivery / grocery API on top of the buy list.
- Localize daily picks to region or season via additional category salts.
- Multi-language voice intents with localized regex maps.

---

# 9. Future Improvements

## Short-term

- **Automated tests** — Playwright for auth flows; unit tests for the pure `parseCommand`; integration tests against a Supabase test DB.
- **Rate limiting** on the Gemini-backed server action before any public launch.
- **Content-hash cache** for Pantry Scan results — same ingredient set should not re-bill Gemini.
- **Whisper fallback** for voice when Web Speech API fails (server-side transcription).
- **Image compression on upload** before sending to Gemini, to cut bandwidth and cost.
- **Roles table** in Supabase with RLS, replacing the `ADMIN_EMAILS` env var.
- **Recipe versioning** when users edit a saved recipe.
- **Better error boundaries** for AI failures with friendly retry UX.

## Long-term

- **Personalization layer** — diet, allergies, history → richer system prompt.
- **Mobile-first PWA** with offline recipe library and background sync.
- **Native push notifications** for cooking timer completion.
- **Multi-language UI + voice** with localized intent parsing.
- **Grocery delivery integrations** (Instacart, regional providers).
- **Analytics dashboard** for admin: most-saved daily picks, most-used voice intents.
- **Collaborative buy lists** for households (Realtime channels per household).
- **Image-to-step guidance** — model annotates each step with a visual.
- **LLM-batch seeded daily picks** with admin review queue, replacing manual curation.

---

# 10. Conclusion

## Summary

This thesis delivers a production-grade, full-stack web application that integrates multimodal generative AI, real-time data synchronization, and browser-native voice control into a single coherent cooking companion. The system covers the home cook's complete workflow — planning, discovery, and hands-free cooking — using only modern web platform technologies.

## What was accomplished

- A maintainable feature-folder architecture across 11 distinct features.
- A multimodal AI pipeline (image + text → structured JSON) with defensive parsing.
- A browser-only voice layer driving real application state (timer + buy list).
- A clean three-client Supabase split that enforces a security boundary by design.
- A four-theme design system using CSS-first tokens in Tailwind v4 and OKLCH colors.
- Deterministic daily content rotation that eliminates an entire class of infrastructure.

## Key lessons learned

- Multimodal AI is production-ready *if* you treat its output as advisory and validate it.
- Deterministic logic beats LLMs when the grammar is small and latency matters.
- Feature folders scale better than layered architectures for medium-sized React apps.
- Per-action security gating survives refactors better than single-point layout guards.
- Browser APIs labelled "standard" still demand feature detection and useful errors.

## Why this project matters

- It demonstrates that the modern web stack is ready to host AI-first, hands-free, real-time experiences without native binaries or proprietary hardware.
- It provides a reusable architectural template that other developers can apply to adjacent domains.
- It shows that thoughtful engineering trade-offs (determinism vs. AI, server actions vs. REST, per-action vs. layout gates) materially improve both UX and maintainability.

## Closing statement

> "By combining multimodal AI, browser-native voice, and a disciplined feature-folder architecture, this project shows that a single modern web application can be the kitchen of the future — and that the platform we already have is enough to build it."

---

# Presentation Structure Recommendation

## Recommended slide order

1. **Title** — project name, subtitle, author, date.
2. **Hook** — one image of the pantry scan in action.
3. **Problem statement** — fragmented cooking UX, touch-hostile environment.
4. **Research objectives** — bullet list.
5. **Existing solutions** — comparison table.
6. **Architecture overview** — single diagram.
7. **Tech stack** — labeled grid of logos.
8. **Feature deep-dive 1: Pantry Scan** — flow diagram + screenshot.
9. **Feature deep-dive 2: Voice Mode** — screenshot + intent grammar.
10. **Feature deep-dive 3: ChefBot Daily Picks** — code snippet of the deterministic hash.
11. **Feature deep-dive 4: Recipe Sharing** — URL anatomy.
12. **Design system** — themes, OKLCH, theme switcher.
13. **Engineering decisions table** — 7 rows.
14. **Challenges and lessons** — 3 spotlight challenges.
15. **Demo flow** — live demo cues.
16. **Innovation / value** — bullet list.
17. **Real-world applications** — industries grid.
18. **Future work** — short-term + long-term split.
19. **Conclusion** — closing statement.
20. **Q&A**.

## Approximate slide count

- ~20 slides.
- Approximate runtime: 15–20 minutes presentation + 5–10 minutes Q&A.

## Sections that should have diagrams

- Architecture overview (data-flow diagram).
- Pantry Scan (request/response sequence).
- Voice Mode (provider + parser + features wiring).
- Three Supabase clients (boundary diagram).

## Sections that should have screenshots

- Home page with daily picks and sidebar.
- Pantry Scan dialog + result.
- Voice mode active state.
- Theme switcher (four themes side by side).
- Admin dashboard.

## Sections that should stay minimal

- Tech stack (logos > prose).
- Existing solutions (table only, no paragraphs).
- Closing slide (one sentence).

---

# Professor Questions & Answers

### Q1. Why did you choose this architecture (feature folders over layered)?

> Feature folders keep each capability self-contained. Adding voice mode never required editing files outside `features/voice/`. Layered architectures fragment a feature across `controllers/`, `services/`, `dtos/`, etc., which makes change risky in a small team. The trade-off — slight duplication of small utilities — is worth the boundary clarity.

### Q2. Why this technology stack?

> Next.js + Supabase removes two services I would otherwise have to build (auth and a REST API). Server actions collapse the mutation pipeline into one file each. TanStack Query gives optimistic UI for free. Gemini 2.5 Flash is the cheapest multimodal model that meets the latency target. The whole stack ships on Vercel + Supabase Cloud with zero config.

### Q3. What are the limitations?

> No automated tests yet — the highest-priority next step. The Web Speech API is unreliable on Linux Chromium. Gemini calls are not cached, so duplicate requests cost twice. Admin auth is email-based; production would need a proper roles table. No rate limiting on the AI endpoint.

### Q4. How is this different from competitors like SuperCook or Yummly?

> Those products are text-only and database-matched. This project takes a photo, infers ingredients with a real multimodal model, and generates *new* recipes rather than retrieving stored ones. It also bundles hands-free voice control and a buy list — competitors require multiple apps.

### Q5. Why use Server Actions instead of a REST API?

> One mutation surface, one auth boundary, automatic cache revalidation, and the API key never reaches the client. A REST API would have required a second auth check, a serialization layer, and a separate cache-invalidation strategy. Server actions collapse all of that into a single `'use server'` file.

### Q6. Why a regex parser for voice instead of an LLM?

> Cooking commands are a small, closed grammar. A regex parser runs locally in ~5ms; an LLM call would add hundreds of milliseconds and a bill per utterance. Determinism also means voice behavior is testable as a pure function. LLMs win on open-ended language — they would be the wrong tool here.

### Q7. How is the system scalable?

> The feature-folder template scales horizontally — any new feature drops into `features/<name>/` without touching others. Supabase scales reads via Realtime channels rather than polling. Gemini calls are stateless and can be load-balanced. Daily picks are deterministic, so they need no caching layer at all. The bottleneck would be Gemini quotas, which a content-hash cache solves.

### Q8. Why did you use AI here?

> Two reasons. First, multimodal AI uniquely solves the "what can I cook with what I have?" question — you cannot do that with a database lookup. Second, it removes the need for a curated recipe corpus, which would have been the most expensive part of the project. AI is used where it adds value (pantry scan) and avoided where it would not (voice intents, daily picks).

### Q9. How do you protect the AI API key?

> The key is read only inside a `'use server'` action that requires an authenticated Supabase user. It never appears in the client bundle, never appears in the network tab, and the action verifies the user before calling Gemini.

### Q10. How is the daily-picks rotation fair to all users?

> It is identical for every user. The pick for a day is derived deterministically by hashing `YYYY-M-D` with a per-category salt and using a `Math.sin`-based PRNG. There is no per-user randomization, so no user can claim unfair rotation — everyone sees the same three picks.

### Q11. What would you improve given more time?

> A Playwright test suite, a Whisper fallback for voice, a content-hash cache on Pantry Scan, a Supabase roles table, rate limiting on AI endpoints, and an analytics dashboard surfacing the most-used voice intents and most-saved recipes.

### Q12. How do you handle authentication on admin routes?

> Admin routes are intentionally excluded from the middleware matcher. Each admin server action calls `checkIsAdmin()` at the top, comparing `user.email` against the `ADMIN_EMAILS` env var. This is defense in depth — no shared layout can fail to guard a future action, because the action gates itself.

---

# Technical Deep Dive

## Pantry Scan AI pipeline

1. Client uploads a base64-encoded image and/or an ingredient string to the server action.
2. Server action checks `supabase.auth.getUser()` — anonymous calls are rejected.
3. Reads `GOOGLE_GENERATIVE_AI_API_KEY` from env.
4. Builds a Gemini request with a system prompt enforcing a JSON envelope, plus `inlineData` for the image and a `text` part for ingredients.
5. Sets `responseMimeType: 'application/json'` and `temperature: 0.7`.
6. Receives text; first attempts `JSON.parse`; on failure, strips ` ```json ` / ` ``` ` and retries.
7. Validates the envelope shape (`ingredients[]`, `recipes[]`) before returning.

## Voice command parsing algorithm

- Normalize: lowercase, strip punctuation, trim.
- Match priority order: voice-off → set-timer → start/pause/reset → mode switch → buy-list ops.
- Number parsing supports digits and word forms ("ten", "fifteen", "thirty").
- Timer durations parsed into milliseconds plus a label.
- Unmatched input returns `{ kind: 'unrecognized', raw }` so the UI can surface a hint.

## Deterministic daily picks

```ts
const seed = `${year}-${month}-${day}`
let hash = 0
for (let i = 0; i < seed.length; i++) {
  hash = (hash << 5) - hash + seed.charCodeAt(i)
  hash = hash & hash
}
const random = (min, max, salt) => {
  const x = Math.sin(Math.abs(hash) + salt) * 10000
  return Math.floor((x - Math.floor(x)) * (max - min)) + min
}
```

- Each category (savory / snack / dessert) uses a different salt.
- `filter` by category, pick by `random(0, length, salt)`.
- Same date → same picks for every user, derivable purely from the calendar.

## Database relations

- `recipes(id, title, content, updated_at, user_id)` — user-owned; Realtime broadcasts changes.
- `buy_list_items(id, title, quantity, checked, created_at, user_id)` — user-owned.
- `daily_picks(id, title, category ∈ {savory, snack, dessert}, content, created_at)` — global, curated by admins.
- `cooking_tips(id, tip, created_at)` — global, curated by admins.
- `user_id` foreign keys to Supabase Auth's `auth.users`.

## Authentication flow

```
Browser → /login → Supabase Auth (email/password, magic link, or Google OAuth)
      ↓ OAuth/magic-link
   /auth/callback (route handler exchanges code → cookie session)
      ↓
   Edge middleware on subsequent requests:
     - `/`        → redirect signed-in to /home, anonymous stays
     - `/home/*`  → redirect anonymous to /login
     - `/admin/*` → not in matcher; each action calls checkIsAdmin()
```

## System communication

- **Client ↔ Server Actions** via `'use server'` RPC.
- **Server Actions ↔ Supabase** via the cookie-aware server client.
- **Browser ↔ Supabase Realtime** via the browser client (sidebar subscribes to `recipes`).
- **Server Actions ↔ Gemini** via the Google GenAI SDK, server-only.

## Performance optimizations

- Optimistic mutations hide round-trip latency.
- Server components by default — less JS shipped.
- `revalidatePath` invalidates only the affected route.
- Realtime channels replace polling.
- Deterministic daily picks need no cache layer.
- LZ-string compression keeps share URLs short enough to fit in clipboard limits.

## Security considerations

- Service-role key isolated in a single server-only file (`lib/supabase/admin.ts`).
- AI API key is server-only via env var; gated behind an authenticated server action.
- All admin actions individually call `checkIsAdmin()`.
- Middleware enforces edge-level redirects before any page render.
- Server actions are authenticated by Supabase cookies, not bearer tokens — CSRF surface is reduced by SameSite cookies.

---

# Slide Content Suggestions

## Slide: Problem

- *Bullets:* Touch-hostile kitchen UX. Fragmented apps. AI ignores what's in the fridge.
- *Speaker note:* Open with a relatable scenario — sticky hands, three open apps, dinner indecision.
- *Visual:* Photo of a cluttered kitchen with three different phones.
- *Keywords:* touch-hostile, fragmented, multimodal gap.

## Slide: Research objectives

- *Bullets:* Multimodal AI, voice control, real-time sync, feature-folder architecture.
- *Speaker note:* Frame as four claims to defend, not just goals.
- *Visual:* Four icons, one per objective.
- *Keywords:* objectives, claims, hypotheses.

## Slide: Architecture

- *Bullets:* App Router · Server Actions · Supabase · Realtime · Gemini.
- *Speaker note:* Walk left-to-right: client → server actions → DB and AI.
- *Diagram:* Boxes for client, server actions, Supabase, Gemini; arrows labeled with the call type.
- *Keywords:* server actions, single mutation surface.

## Slide: Tech stack

- *Bullets:* Next.js 16, React 19, TypeScript strict, Tailwind v4, Supabase, Gemini, TanStack Query.
- *Speaker note:* Mention *why* each was chosen, not what it is.
- *Visual:* Logo grid.
- *Keywords:* modern, web-first, integrated.

## Slide: Pantry Scan

- *Bullets:* Photo + text → JSON envelope → 3 recipes.
- *Speaker note:* Mention the defensive parser and the API-key isolation.
- *Diagram:* Sequence — client → server action → Gemini → parsed JSON → client.
- *Visual:* Screenshot of the scan dialog.
- *Keywords:* multimodal, structured output, defensive parsing.

## Slide: Voice mode

- *Bullets:* Web Speech + Wake Lock + regex intents.
- *Speaker note:* Justify regex over LLM.
- *Diagram:* Intent grammar table.
- *Visual:* Screenshot of voice toggle.
- *Keywords:* deterministic, hands-free, wake lock.

## Slide: Daily picks

- *Bullets:* Hash(date) → deterministic 3 picks → identical for everyone.
- *Speaker note:* Highlight that this eliminates a cron job.
- *Diagram:* Calendar → hash → picks.
- *Keywords:* deterministic, no scheduler.

## Slide: Design system

- *Bullets:* Tailwind v4 CSS-first tokens · OKLCH · four themes via classes.
- *Speaker note:* Mention perceptual uniformity.
- *Visual:* Four theme thumbnails side by side.
- *Keywords:* OKLCH, CSS-first, class-based theming.

## Slide: Engineering decisions

- *Bullets:* 7 decisions with one-line justifications.
- *Speaker note:* Each row is a defensible trade-off.
- *Visual:* Comparison table.
- *Keywords:* trade-offs, defense in depth, determinism.

## Slide: Challenges

- *Bullets:* JSON drift, Web Speech fragility, intent-parsing trade-off.
- *Speaker note:* Pick one to tell as a story.
- *Visual:* Before/after of a failed parse.
- *Keywords:* fallback parser, latency, cost.

## Slide: Demo

- *Bullets:* Sign in → Pantry Scan → save → voice timer → share → theme cycle.
- *Speaker note:* Time-box at 4 minutes.
- *Visual:* Numbered demo path on top of a screenshot.
- *Keywords:* end-to-end, hands-free.

## Slide: Innovation

- *Bullets:* Multimodal, browser-native voice, deterministic content, URL-as-payload.
- *Speaker note:* Reuse the value propositions.
- *Keywords:* unique value, novel pairings.

## Slide: Future work

- *Bullets:* Tests · cache · Whisper fallback · roles table · rate limiting.
- *Speaker note:* Split short-term vs. long-term.
- *Keywords:* roadmap, scalability.

## Slide: Conclusion

- *Bullets:* One web stack. Full workflow. Reusable template.
- *Speaker note:* Deliver the closing statement verbatim.
- *Keywords:* coherent, web-first, reproducible.

---

# Visual Assets to Capture

- [ ] Landing page (marketing route).
- [ ] Login page with Google OAuth button.
- [ ] Signup page.
- [ ] Home dashboard with daily picks and sidebar.
- [ ] Pantry Scan dialog (camera + ingredients).
- [ ] Pantry Scan result with three recipes.
- [ ] Saved recipe detail page.
- [ ] Buy list with mixed checked/unchecked items.
- [ ] Timer in countdown mode.
- [ ] Timer in stopwatch mode.
- [ ] Voice toggle in idle and active states.
- [ ] Voice mode handling a buy-list command.
- [ ] Theme switcher dropdown.
- [ ] Four themes side-by-side comparison.
- [ ] Share URL anatomy diagram.
- [ ] Recipient view of `/share?data=...`.
- [ ] Admin dashboard overview.
- [ ] Admin: daily picks CRUD.
- [ ] Admin: cooking tips CRUD.
- [ ] Admin: user list with delete confirmation.
- [ ] Architecture diagram (custom asset).
- [ ] Pantry Scan sequence diagram (custom asset).
- [ ] Voice provider wiring diagram (custom asset).
- [ ] Three Supabase clients boundary diagram (custom asset).
- [ ] Feature-folder tree (custom asset).

---

# Final Summary for AI Slide Generator

## Executive summary

A full-stack Next.js 16 web application that delivers a unified cooking companion across planning, discovery, and hands-free cooking. Multimodal AI (Google Gemini 2.5 Flash) turns a fridge photo into three differentiated recipes. Browser-native Web Speech and Wake Lock APIs provide a deterministic voice-control layer over the timer and buy list. Supabase handles auth, Postgres, and Realtime sync; Next.js Server Actions are the single mutation surface, with three role-separated Supabase clients enforcing security boundaries. A feature-folder architecture across 11 features keeps the codebase scalable, and a Tailwind v4 + OKLCH design system delivers four switchable themes via CSS-first tokens.

## Preferred presentation tone

- Confident, engineering-led, trade-off-oriented.
- Each design decision presented as a defensible choice with a justification.
- Concise: bullets over paragraphs; show code only where it strengthens an argument.

## Preferred visual style

- Modern, minimal, generous whitespace.
- Sans-serif (Outfit or Inter) to match the product.
- Icons over stock photography.
- Code snippets in monospaced blocks with syntax highlighting.

## Color / theme suggestions

- Lead with the product's green theme (default) — establishes brand identity.
- Optional accent slides in red / blue / yellow to mirror the theme switcher.
- OKLCH-derived palette for perceptual consistency.
- Dark backgrounds for screenshots; light backgrounds for diagrams.

## Presentation pacing

- ~45 seconds per slide on average.
- Architecture and Pantry Scan slides may run 90 seconds.
- Demo segment: 4–5 minutes, time-boxed.
- Q&A: 5–10 minutes.

## Recommended presentation duration

- **Talk:** 15–20 minutes.
- **Live demo:** 4–5 minutes (inside the talk).
- **Q&A:** 5–10 minutes.
- **Total:** 25–30 minutes.
