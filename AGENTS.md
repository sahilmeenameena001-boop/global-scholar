# Global Scholars — project rules

A multipage, scroll-driven marketing site for a **fictional** study-abroad
consultancy. Next.js App Router, React 19, Tailwind v4, TypeScript strict.

## Architecture

- Multipage App Router. `src/data/nav.ts` is the site map: every entry is a real
  route (`/about`, `/countries`, `/universities`, `/scholarships`,
  `/how-it-works`, `/stories`) and the same list drives the header, the footer,
  the chapter rail and the home page's teaser grid. To add a page: add the entry
  there, create `src/app/<slug>/page.tsx` with its own `metadata`, and render the
  section plus `<PageNav current="/<slug>" />`.
- Home (`src/app/page.tsx`) is the hook only — `Hero`, `Explore`, `BoardingPass`.
  The chrome (header, rail, footer) lives in `src/app/layout.tsx` so it survives
  client-side navigation.
- Chapter numbers, eyebrows and rail labels come from `nav.ts`, never typed into
  a section by hand; `ChapterHead` takes them via `navByHref["/route"]`.
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
  `window.__lenis` and reached through `src/lib/lenis.ts`. In-page anchor clicks
  are intercepted globally by `SmoothAnchors` — it only matches `a[href^="#"]`,
  so keep anchor hrefs bare (`#book`, not `/#book`) or smooth scrolling silently
  breaks. Lenis survives navigation, so `RouteScroll` resets the position and
  refreshes ScrollTrigger on every route change.
- Route links use `next/link` (`Button` switches to it for any `href` starting
  with `/`). Never link between pages with a plain `<a>`.
- Reveals use `gsap.fromTo`, never `gsap.from`. A `from` tween re-records the
  element's *current* state as its destination, so an effect that runs twice
  (React Strict Mode, a remount) animates hidden → hidden and the content never
  appears.
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
- People and places are drawn, not photographed. `PortraitArt` generates a
  portrait deterministically from a person's name and `CountryArt` illustrates
  each destination, so nothing on the site can be mistaken for a photo of a real
  student or a verified place. Do not swap in stock photography of people.

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
  and the server route. Change the rules in one place only. A lead carries an
  optional `context` string naming what the enquiry is about (the scholarship a
  student clicked, say); pass it to `LeadForm` rather than adding a new field.
- The site is dark-only. Use the theme tokens for text (`ivory`, `mist`,
  `faint`) — `ink` and `navy` are dark-on-light leftovers and will disappear
  against a `surface` or `raised` background.

## Checks

`npx tsc --noEmit` and `npm run lint` must both pass before the work is done.
