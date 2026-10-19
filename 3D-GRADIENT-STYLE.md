# 3D "Lit Surface" Gradient Style — Portable Guide

A reusable design system for giving a flat UI a soft, tactile, **3D "lit-from-above"**
look — raised cards, beveled panels, carved-in inputs, and pressable buttons — without
heavy skeuomorphism. Drop this file into any project and tell Claude Code:

> "Apply the 3D lit-surface style described in `3D-GRADIENT-STYLE.md` to this project."

It's framework-agnostic in principle, but the snippets below target **Tailwind CSS v4 +
shadcn/ui** (the stack it was designed in). If the target project uses something else,
Claude should translate the *technique* (the gradients + layered shadows), not copy the
class names verbatim.

---

## 1. The core idea

Every surface is treated like a physical object lit from directly above:

- **Top edge** catches light → a 1px inset white highlight.
- **Body** has a faint top-to-bottom gradient (light at top, slightly darker at bottom)
  so the surface looks gently curved/convex.
- **Bottom edge** is in shadow → a 1px inset dark line.
- **Whole object** casts a soft drop shadow to float above the background.

Four surface "moods" express depth:

| Mood | Feeling | Where to use |
|------|---------|--------------|
| **Raised** | Sits slightly above the page | Cards, list items, active sidebar item, idle dropzones |
| **Panel** | A large floating slab | The main content area / work surface |
| **Sunken** | Carved into the page | Text inputs, textareas, selects |
| **Well** | A deep recessed pit | Drag-over dropzones, wells |

Buttons reuse the raised look but add a **press** state (gradient flips + translate down 1px).

The whole effect is built from two primitives only: **a subtle linear gradient** + **layered
`box-shadow`s** (inset highlight, inset shade, outer drop). No images, no extra DOM.

---

## 2. Design tokens (CSS variables)

These hold the gradients/shadows for **both light and dark** so call sites never need
`dark:` variants. Paste into your global stylesheet.

```css
:root {
  /* raised surface: lit top, shaded bottom + soft lift */
  --surface-raised-gradient: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.5),
    rgba(0, 0, 0, 0.025)
  );
  --surface-raised-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
    inset 0 -1px 0 0 rgba(0, 0, 0, 0.05),
    0 1px 3px 0 rgba(0, 0, 0, 0.08),
    0 1px 2px -1px rgba(0, 0, 0, 0.06);

  /* large floating panel: bevel + lift, NO surface gradient (keeps big areas clean) */
  --surface-panel-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.8),
    0 8px 22px -8px rgba(0, 0, 0, 0.16),
    0 3px 8px -5px rgba(0, 0, 0, 0.1);

  /* panel header band (sits on top of the panel) */
  --surface-header-gradient: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.6),
    rgba(0, 0, 0, 0.04)
  );
  --surface-header-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.7);

  /* panel body band */
  --surface-body-gradient: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.5),
    rgba(0, 0, 0, 0.06)
  );

  /* sunken field: carved-in inner shadow */
  --surface-sunken-shadow:
    inset 0 1px 2px 0 rgba(0, 0, 0, 0.06),
    inset 0 -1px 0 0 rgba(255, 255, 255, 0.7);
}

.dark {
  /* In dark mode the white highlights drop way down (0.04–0.08) and the
     shadows deepen (0.25–0.5). The structure is identical — only the alphas change. */
  --surface-raised-gradient: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.04),
    rgba(0, 0, 0, 0.1)
  );
  --surface-raised-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 0 rgba(0, 0, 0, 0.25),
    0 1px 3px 0 rgba(0, 0, 0, 0.3);

  --surface-panel-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.08),
    0 8px 22px -8px rgba(0, 0, 0, 0.5);

  --surface-header-gradient: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.05),
    rgba(0, 0, 0, 0.12)
  );
  --surface-header-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.06);

  --surface-body-gradient: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.04),
    rgba(0, 0, 0, 0.16)
  );

  --surface-sunken-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.3);
}
```

### The golden rule of alphas
The gradients/shadows are **alpha-only black & white over a colored base** — they never
hardcode a color. That's why the same tokens work over a white card, a tinted card, or a
dark card: they only *lighten the top* and *darken the bottom* of whatever color is
underneath. Keep it this way so the style survives theme/color changes.

---

## 3. Utility classes

In Tailwind v4, expose the tokens as `@utility` rules (plain classes — they won't collide
with `bg-*` in `tailwind-merge`). Light/dark is already handled by the variables.

```css
@utility surface-raised {
  background-image: var(--surface-raised-gradient);
  box-shadow: var(--surface-raised-shadow);
}
@utility surface-panel {
  box-shadow: var(--surface-panel-shadow);
}
@utility surface-header {
  background-image: var(--surface-header-gradient);
  box-shadow: var(--surface-header-shadow);
}
@utility surface-body {
  background-image: var(--surface-body-gradient);
}
@utility surface-sunken {
  box-shadow: var(--surface-sunken-shadow);
}

/* recessed "drop well" — same in both themes (e.g. upload drag-over) */
@utility surface-well {
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgba(0, 0, 0, 0.04)
  );
  box-shadow:
    inset 0 2px 6px -1px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 0 rgba(0, 0, 0, 0.05);
}
```

> **Not on Tailwind v4?** Make them ordinary CSS classes (`.surface-raised { … }`) using the
> same two declarations. The technique is identical.

---

## 4. How to apply it to components

The gradients are *translucent over a base color*, so each element still needs its own
`bg-*` (solid background) — the surface utility layers the lighting on top.

```tsx
// Card — raised
<div className="bg-card text-card-foreground rounded-xl border py-6 surface-raised" />

// Main work area — a big floating panel with a header band and a body band
<div className="rounded-lg border bg-card surface-panel">
  <header className="h-14 bg-card-hover border-b surface-header">…</header>
  <div className="flex-1 overflow-y-auto surface-body">{children}</div>
</div>

// Text input — sunken/carved
<input className="border rounded-md bg-transparent px-3 py-1 surface-sunken
                  transition-[color,box-shadow] outline-none" />

// Table header — reuse the header band
<thead className="surface-header">…</thead>

// Active sidebar item — raised so it pops off the rail
<a className="rounded-lg … sidebar-item-active surface-raised">…</a>
```

**Rules of thumb**
- One mood per element. Don't stack `surface-raised` and `surface-sunken`.
- Big areas → `surface-panel` (no body gradient, stays clean). Small repeated items → `surface-raised`.
- Anything the user types into → `surface-sunken`. Anything you drop files into → `surface-well` on drag-over.
- Always pair with a solid `bg-*`; the utility only adds lighting.

---

## 5. Buttons — raised + pressable

Buttons are the showpiece. They use the same lit-surface recipe, plus a **press** state:
on `:active` the gradient flips (`to top`), the shadow becomes a deep inset, and the button
nudges down 1px (`translate-y-px`). This sells the "physical press."

Recipe for any button variant (Tailwind arbitrary values shown; adapt alphas to the variant's base color):

```
/* resting */
[background-image:linear-gradient(to_bottom,rgba(255,255,255,0.10),rgba(0,0,0,0.15))]
shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),inset_0_-1px_0_0_rgba(0,0,0,0.22),0_1px_2px_0_rgba(0,0,0,0.18)]

/* pressed */
active:[background-image:linear-gradient(to_top,rgba(255,255,255,0.10),rgba(0,0,0,0.15))]
active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.28),inset_0_1px_0_0_rgba(0,0,0,0.12)]
active:translate-y-px

/* dark mode: lower the white, deepen the dark */
dark:[background-image:linear-gradient(to_bottom,rgba(255,255,255,0.06),rgba(0,0,0,0.18))]
dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_1px_2px_0_rgba(0,0,0,0.25)]
```

Per-variant tuning (light mode):

| Variant | Top-highlight alpha | Notes |
|---------|--------------------|-------|
| **Light / secondary / outline** (light base) | `rgba(255,255,255,0.35–0.55)` strong | bright lit edge reads well on light fill |
| **Dark / primary** (near-black base) | `rgba(255,255,255,0.10–0.18)` | subtle, the dark fill swallows highlight |
| **Colored / accent** (saturated base) | gradient starts at `rgba(255,255,255,0)` | **no top white** — it would wash out the color; only darken toward the bottom and add a crisp lit edge via the inset highlight shadow |

That last row is the key trick for keeping saturated buttons (and colored active states)
vivid: skip the white in the *gradient*, keep it only in the *inset top shadow*.

---

## 6. Playing nice with theming / color modes

If your project tints surfaces per theme (color modes, brand themes), keep the surface
tokens **color-free** (alpha black/white only) — they'll automatically lay correct lighting
over any tinted `bg-*`. When an element is filled with a *saturated accent* (e.g. an active
nav item in an accent color), use the "no top white" gradient so the color stays punchy:

```css
.accent-filled-item {
  background-color: var(--accent);
  background-image: linear-gradient(to bottom, rgba(255,255,255,0), rgba(0,0,0,0.15));
  box-shadow:
    inset 0 1px 0 0 rgba(255,255,255,0.22),
    inset 0 -1px 0 0 rgba(0,0,0,0.22),
    0 1px 2px 0 rgba(0,0,0,0.18);
}
```

---

## 7. Quick checklist for Claude Code

When asked to apply this style to a project:

1. Add the `:root` and `.dark` token blocks (§2) to the global stylesheet.
2. Add the `@utility` classes (§3) — or plain `.class` equivalents if not Tailwind v4.
3. Apply moods (§4): `surface-raised` on cards/list items, `surface-panel` + `surface-header`
   + `surface-body` on the main layout, `surface-sunken` on inputs, `surface-well` on dropzones.
4. Rework the button component with the resting/pressed/dark recipe (§5), tuning the
   top-highlight alpha per variant.
5. Verify in **both light and dark**, and over any tinted theme — adjust alphas, never add colors.
6. Keep gradients subtle: if it looks glossy or plasticky, lower the alphas. The target is
   "gently lit paper," not "glass button."
