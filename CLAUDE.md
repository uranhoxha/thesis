# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server on http://localhost:3000
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint via `eslint-config-next` (Core Web Vitals + TS rules)

There is no test runner configured.

## Stack

Next.js 16 (App Router) + React 19, TypeScript strict, Tailwind v4 (no `tailwind.config`; theme tokens live in `app/globals.css` via `@theme inline`), shadcn/ui ("new-york", lucide icons), TanStack Query v5, Supabase (`@supabase/auth-helpers-nextjs` + `@supabase/supabase-js`). Path alias `@/*` maps to repo root.

## Architecture

### Feature-folder layout

App code is organized by feature under `features/<name>/` with a consistent shape:

```
features/<feature>/
  api/         server actions ('use server') — the only place that talks to Supabase
  components/  React components
  hooks/       client hooks (useQuery / useMutation wrappers)
  types/       TS interfaces
  providers/   React context (when needed)
```

`app/` only contains thin route files (route groups: `app/(pages)/{home,login,signup,share,admin}`). Pages compose feature components — never put business logic in `app/`.

### Three Supabase clients (don't mix them up)

- `lib/supabase/server.ts` — `createClient()`, cookie-aware, for server actions and route handlers. Used inside `'use server'` files.
- `lib/supabase/browser.ts` — `createClient()`, for client components that need realtime subscriptions (e.g. `components/layout/sidebar.tsx` subscribes to `recipes` table changes).
- `lib/supabase/admin.ts` — `supabaseAdmin`, uses `SUPABASE_SERVICE_ROLE_KEY`. **Server-only.** Used only in `features/admin/actions.ts` for `auth.admin.*` operations (listing/deleting users).

### Data-flow pattern

Server actions in `features/*/api/*.ts` (or `features/admin/actions.ts`) do all DB work, then call `revalidatePath('/...')`. Client components consume them through `useQuery`/`useMutation` hooks in `features/*/hooks/`. Mutations use optimistic updates with rollback on error — see `features/buy-list/hooks/use-buy-list.ts` as the canonical example (cancel queries → snapshot → setQueryData → onError rollback → onSettled invalidate). Match this pattern for new mutations.

### Auth and route protection

`middleware.ts` matches `/` and `/home/:path*`. It redirects `/` to `/home` (signed in) or `/login` (signed out), and bounces unauthenticated users on `/home/*` to `/login`. **Note:** `/admin/*` is *not* in the matcher — admin routes rely on server-side `checkIsAdmin()` (`features/admin/actions.ts`) gating each action. `checkIsAdmin` compares `user.email` to a comma-separated `ADMIN_EMAILS` env var. When adding admin actions, gate them with `checkIsAdmin()` at the top of every server action — there is no shared admin layout guard.

OAuth/magic-link callback lands at `/auth/callback` (`app/auth/callback/route.ts`) which exchanges the code and redirects to `/home`.

### Theming

Four themes (`green` default, `red`, `blue`, `yellow`) implemented as CSS classes on `<html>` (`theme-red`, `theme-blue`, `theme-yellow`; green = no class). Managed by `features/settings/hooks/use-theme.tsx` (`ThemeProvider` wraps the app via `providers/providers.tsx`) and persisted in `localStorage` under key `app-theme`. The sidebar logo swaps based on the theme. Use `cn()` from `lib/utils.ts` for class merging (clsx + tailwind-merge).

### Recipe sharing

`/share?data=<lz-string>` decodes a recipe payload compressed with `lz-string` (`compressToEncodedURIComponent` / `decompressFromEncodedURIComponent`). The signed-in user can save the shared recipe via `createRecipe()`. See `features/home/hooks/use-recipe.ts` (`handleShare`) and `app/(pages)/share/page.tsx`.

### ChefBot daily picks

`features/chef-bot/api/daily-picks.ts` deterministically picks one recipe per category (`savory`, `snack`, `dessert`) per day by hashing the date string — same picks for everyone on a given day. Categories are an enum in `features/admin/types.ts`; if you add categories, update the filter logic in `getDailyPicksFromDB` and the admin form.

## Database tables (Supabase)

Inferred from server actions; schema is managed in Supabase, not in this repo:

- `recipes` — `id`, `title`, `content`, `updated_at`, `user_id`
- `buy_list_items` — `id`, `title`, `quantity`, `checked`, `created_at`, `user_id`
- `daily_picks` — `id`, `title`, `category` (`savory`|`snack`|`dessert`), `content`, `created_at`
- `cooking_tips` — `id`, `tip`, `created_at`

## Environment variables

Required in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only; powers `supabaseAdmin`
- `ADMIN_EMAILS` — comma-separated emails granted admin access
