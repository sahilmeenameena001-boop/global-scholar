# Global Scholars — project rules

A single-page, scroll-driven marketing site for a **fictional** study-abroad
consultancy. Next.js App Router, React 19, Tailwind v4, TypeScript strict.

## Architecture

- One route (`src/app/page.tsx`). Every "page" is a `<section>` with an `id`;
  navigation is in-page anchors, never routes. Do not add routes for content —
  add a section, register its `id` in `ChapterRail.STOPS`, and link to `#id`.
- `src/components/sections/*` — full-width page chapters, one per file.
- `src/components/ui/*` — reusable primitives. `anim.tsx` and `fx.tsx` hold the
  shared motion wrappers (`Reveal`, `Tilt`, `useFinePointer`).
- `src/components/three/*` — the R3F canvas. Mounted once in `Providers`, never
  per-section; sections talk to it through `sceneStore.ts`.
- `src/data/*` — all copy and content. Components must not hard-code marketing
  strings; put them here so they stay editable in one place.
- `src/lib/*` — framework-free helpers and hooks.

## Motion

- Smooth scrolling is Lenis, mounted in `SmoothScroll`, exposed as
  `window.__lenis`. Anchor clicks are intercepted globally by `SmoothAnchors` —
  it only matches `a[href^="#"]`, so keep anchor hrefs bare (`#quiz`, not
  `/#quiz`) or smooth scrolling silently breaks.
- Every animation must have a reduced-motion path. Use `useReducedMotion()` and
  branch; never ship a motion-only affordance.
- GSAP is imported from `@/lib/gsap` (registers plugins once). Never
  `import { gsap } from "gsap"` directly.
- Pointer-driven effects (magnetic buttons, tilt, the chapter rail) gate on
  `useFinePointer()` so touch devices skip them.

## Content integrity

This is demo content for a consultancy that does not exist. Scholarships,
stories and counsellors are invented and labelled as such in `content.ts`.

- Keep the disclaimer in `Footer` and the per-dataset comments intact.
- Never present invented figures — deadlines, award amounts, success rates — as
  verified fact, and never add outcome guarantees about admissions, funding or
  visas.
- Contact details, social profiles and legal documents live in `src/data/site.ts`
  and `src/data/legal.ts`. They ship unconfigured on purpose; a social icon with
  no `href` is hidden rather than pointed at a dead link.

## Conventions

- Tailwind v4 — theme tokens are declared in `src/app/globals.css`
  (`royal`, `royal-lit`, `coral`, `ivory`, `mist`, `faint`, `navy`, `surface`,
  `raised`, `void`, `shadow-lift`, `shadow-glow`). Use the tokens, not raw hex.
- `"use client"` only where state, effects or event handlers are needed. Section
  wrappers stay server components where they can.
- Accessibility is not optional: every section needs `aria-labelledby`, icons
  are `aria-hidden`, interactive targets are at least 44px (`min-h-12` /
  `size-11`), and form errors use `aria-invalid` + `role="alert"`.
- Form validation lives in `src/lib/validation.ts` and runs on both the client
  and the server route. Change the rules in one place only.

## Checks

`npx tsc --noEmit` and `npm run lint` must both pass before the work is done.
