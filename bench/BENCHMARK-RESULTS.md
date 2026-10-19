# Benchmark Results — "Sous-Chef" Recipe App

**Environment:** Linux 6.18 (Fedora), Node v22.22.0, single machine, 2026-06-19.
Scripts live in `bench/` and are re-runnable. The voice parser and pantry-scan
source files were **not** modified.

**How to re-run:**

- Benchmark 1: `node_modules/.bin/tsx bench/bench-parser.ts`
- Benchmark 2: `node --env-file=.env.local node_modules/.bin/tsx bench/bench-pantry-scan.ts`
- Benchmark 3: `npx next build && npx next start -p 3100` then
  `CHROME_PATH=/usr/bin/chromium-browser node_modules/.bin/lighthouse "http://localhost:3100/login" --only-categories=performance --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage"`

---

## Benchmark 1 — Voice Intent Parser (latency + accuracy)

**Target:** `parseCommand` in `features/voice/lib/parse-command.ts` (run unmodified via `tsx`).
**Method:** 56 hand-curated, hand-labelled utterances covering every intent the
parser supports, plus 5 deliberately awkward/typo inputs. Each call timed
individually with `performance.now()`. Intents compared at sub-intent
granularity (countdown vs stopwatch; check vs uncheck).

### Accuracy

| Metric | Value |
|---|---|
| Test-set size | 56 |
| Correct | 52 |
| **Accuracy** | **92.86 %** |

All 4 failures were on the deliberately-awkward inputs; **every clean/canonical
utterance passed**.

| Utterance | Expected | Got | Reason |
|---|---|---|---|
| `"give me a timer for 3 minutes"` | set-timer | unrecognized | verb "give" not in parser's `set/start/begin/make` whitelist |
| `"pause the timer please"` | stop-timer | unrecognized | trailing "please" breaks the anchored `^…$` regex |
| `"ad milk to my list"` | add-buy-item | unrecognized | typo "ad" (no fuzzy matching) |
| `"timer 90 seconds"` | set-timer | unrecognized | requires "for"/"of" after "timer" |

### Latency (n = 56, single call each)

| Metric | ms |
|---|---|
| Cold-start (first call after module load) | 0.580 |
| Steady-state median | 0.007 |
| Steady-state p95 | 0.321 |
| Steady-state max | 1.226 |
| Steady-state min | 0.001 |

**Flags:** Latencies are at the resolution floor of the JS timer; the max
(1.226 ms, on the first buy-list regex path) reflects one-time JIT warm-up, not
steady cost. The parser is effectively free (sub-millisecond); the meaningful
result is **accuracy on natural phrasing**, where robustness drops on
out-of-grammar verbs, trailing politeness words, and typos.

---

## Benchmark 2 — Pantry Scan / Gemini Pipeline Reliability

**Target:** `generateRecipesFromPantry` in `features/pantry-scan/api/scan.ts`,
model `gemini-2.5-flash`.

**⚠️ Refactor disclosure (could not call the function directly):** The server
action is a single `'use server'` function that opens a cookie-aware Supabase
client and calls `auth.getUser()` before the Gemini call — that throws outside a
Next.js request context, and there is no separable "core logic" export. Since
source modification was forbidden, `bench/bench-pantry-scan.ts`
**re-implements the post-auth half of the pipeline verbatim** (identical model
id, system prompt, generation config `{responseMimeType:'application/json',
temperature:0.7}`, and the same `JSON.parse`-with-code-fence-fallback). A runtime
integrity check reads `scan.ts` and aborts if any copied constant drifts (it
passed). Only auth and `revalidatePath` are absent — neither affects the
round-trip being measured.

**Test image:** `bench/fixtures/fridge.png` — a baking-ingredients flat-lay
**provided by the user** (sugar, eggs, flour, butter, vanilla, leavener). Note:
it's an ingredient layout, not a literal fridge interior. 20 sequential runs, no
retry/backoff (matching production, which also has none).

### Per-run results (all 20)

| Run | Latency (ms) | JSON ok | Shape ok | Recipe titles / outcome |
|---|---|---|---|---|
| 1 | 10750 | Y | Y | Toasted Sesame Cookies / Classic Vanilla Butter Cake / Fluffy Pancakes w/ Scrambled Eggs |
| 2 | 3235 | — | — | **HTTP 503 UNAVAILABLE (high demand)** |
| 3 | 10753 | Y | Y | Classic Vanilla Sponge Cake / Sesame Butter Cookies / Quick Savory Sesame Flatbread |
| 4 | 14138 | Y | Y | Classic Butter Cookies w/ Sesame Sprinkle / Crispy Sesame Tuiles / Simple Vanilla Mug Cake |
| 5 | 16427 | Y | Y | Sesame Butter Cookies / Classic Vanilla Pound Cake / Simple Vanilla Crepes |
| 6 | 2549 | — | — | **HTTP 503 UNAVAILABLE (high demand)** |
| 7 | 1012 | — | — | **HTTP 429 RESOURCE_EXHAUSTED (free-tier, 5 req/min)** |
| 8 | 15379 | Y | Y | Sesame Butter Cookies / Simple Vanilla Sponge Cake / Classic Water-Based Crêpes |
| 9 | 21176 | Y | Y | Sesame Seed Cookies / Classic Vanilla Sponge Cake / Basic Choux Pastry |
| 10 | 17597 | Y | Y | Classic Butter Cookies / Simple Vanilla Sponge Cake / Crispy Sesame Snaps |
| 11 | 11192 | Y | Y | Classic Butter Cookies w/ Sesame / Simple Vanilla Sponge Cake / Quick Basic Pancakes |
| 12 | 13620 | Y | Y | Sesame Butter Cookies / Simple Vanilla Pound Cake w/ Glaze / Classic Vanilla Custard |
| 13 | 23655 | Y | Y | Classic Butter Cookies (Shortbread) / Simple Vanilla Cake / Crispy Sesame Lace Cookies |
| 14 | 17447 | Y | Y | Classic Butter Cookies w/ Toasted Sesame / Simple Vanilla Sponge Cake / Crunchy Sesame Brittle |
| 15 | 15217 | Y | Y | Sesame Butter Cookies / Simple Sweet Crepes / Classic Vanilla Sponge Cake |
| 16 | 19884 | Y | Y | Sesame Butter Cookies / Classic Vanilla Crepes / Simple Vanilla Sponge Cake |
| 17 | 11553 | Y | Y | Classic Butter Cookies / Simple Vanilla Custard / Savory Sesame Crackers |
| 18 | 10365 | Y | Y | Classic Butter Cookies / Sesame Seed Cookies / Simple Vanilla Sponge Cake |
| 19 | 12775 | Y | Y | Classic Butter Cookies / Simple Vanilla Sponge Cake / Crispy Sesame Lace Cookies |
| 20 | 15361 | Y | Y | Classic Butter Cookies w/ Sesame / Simple Vanilla Sponge Cake / Crispy Sesame Crackers |

### Summary

| Metric | Value |
|---|---|
| Runs | 20 |
| **End-to-end success rate** (valid JSON + valid shape) | **85.0 % (17/20)** |
| Failures | 3 — all **upstream API errors** (2× HTTP 503, 1× HTTP 429), **0 pipeline/parsing failures** |
| **Pipeline reliability when API responded** | **100 % (17/17)** JSON parsed (0 needed the code-fence fallback); 17/17 matched `{ ingredients: string[], recipes: [3 × {title, content}] }` |
| Median latency (17 successful runs) | **15,217 ms** |
| p95 latency (successful runs) | 23,655 ms |
| min / max (successful) | 10,365 / 23,655 ms |
| (median over all 20, incl. fast error responses) | 13,620 ms |

### Recipe distinctness

- **Within each run:** all 17 valid runs returned **3 distinct titles** — no
  intra-run duplicates.
- **Across runs:** only **31 unique titles out of 51** — the model converges
  heavily on the same dishes for this image:

| Times across runs | Title |
|---|---|
| 8× | simple vanilla sponge cake |
| 6× | sesame butter cookies |
| 4× | classic butter cookies |
| 3× | classic vanilla sponge cake |
| 2× | sesame seed cookies / "…with sesame" / crispy sesame lace cookies |

### Cost

Measured token usage (summed over 17 successful runs): **prompt/input = 8,262**,
visible output = 19,028, **total = 55,192** → implied **thinking tokens ≈
27,902** (gemini-2.5-flash is a reasoning model; thinking tokens are billed at
the output rate but excluded from `candidatesTokenCount`).

- **Actual cost incurred: ~$0 (free tier)** — confirmed by the HTTP 429
  `free_tier_requests` quota error.
- **Estimated paid-tier cost (ASSUMED rates $0.30/1M in, $2.50/1M out):**
  **$0.05** (visible output only) to **$0.12** (including thinking tokens) for
  all 17 calls → **≈ $0.007 per successful scan**.

**Flags:** (1) The 85% headline conflates infrastructure availability with
pipeline correctness — the pipeline itself was **100% reliable** on every
response; the failures are free-tier rate-limiting (5 req/min) and transient
503s. (2) Production `scan.ts` has **no retry/backoff**, so these failures would
surface directly to users. (3) Pricing rates are assumed, not authoritative.

---

## Benchmark 3 — Lighthouse Performance Audit

**Deployment:** No Vercel/production URL exists (README is the default
create-next-app template). Audited a **local production build**
(`next build` + `next start`).

**⚠️ Important method notes:**

- A dev server (`next dev`) was already occupying port 3000, so the audit ran
  against a clean **production** build on **port 3100** (confirmed hashed
  bundles + `Cache-Control: s-maxage=31536000`). Auditing the dev server would
  have given invalid numbers.
- **`/home` (authenticated home) was NOT audited** — it returns `307 → /login`
  for unauthenticated requests and cannot be reached headlessly without real
  credentials. It was **not** faked. Only the **public `/login`** route is
  reported.
- Lighthouse 13.4.0, headless Chromium, **mobile form factor + simulated
  throttling** (Lighthouse defaults: ~Slow-4G network, 4× CPU). 3 runs.

### `/login` (public) — 3 runs

| Metric | Run 1 | Run 2 | Run 3 | **Median** |
|---|---|---|---|---|
| **Performance score (0–100)** | 87 | 82 | 95 | **87** |
| **LCP** (ms) | 3264 | 3319 | 2675 | **3264** |
| **CLS** | 0.000 | 0.000 | 0.000 | **0.000** |
| **TTFB** (ms) | 9 | 3 | 2 | **3** |
| FCP (ms) | 2739 | 2793 | 1837 | 2739 |
| Speed Index (ms) | 3062 | 4590 | 1837 | 3062 |
| Total Blocking Time (ms) | 100 | 200 | 55 | 100 |
| Time to Interactive (ms) | 3271 | 3326 | 2996 | 3271 |

**Flags:** (1) **TTFB (~3 ms) is not representative of production** — it's a
localhost request with no network hop; a deployed server would be far higher.
(2) Run-to-run variance is significant (score 82–95) due to simulated throttling
on a shared machine — report the median. (3) LCP ~3.3 s (median) under simulated
Slow-4G is the main lever; CLS is a perfect 0.

---

## Things skipped / approximated (consolidated)

1. **Benchmark 2 pipeline could not be imported directly** — re-implemented
   post-auth verbatim with an integrity guard; no source changed.
2. **Benchmark 2 image** is a user-provided ingredient flat-lay, not a literal
   fridge interior.
3. **Benchmark 2 cost is free-tier ($0 actual)**; paid-tier figure is an
   estimate with assumed rates, with a thinking-token correction.
4. **Benchmark 3 `/home` route skipped** — auth-gated, no headless login.
5. **Benchmark 3 TTFB is localhost-only** and understated vs. a real
   deployment; Lighthouse used default mobile + simulated throttling.
