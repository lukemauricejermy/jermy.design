# jermy.design

Personal design portfolio. Next.js App Router site, content from DatoCMS, deployed on Vercel.

## Stack

- **Next.js 16** (App Router, React Server Components) + **React 19**, TypeScript
- **Tailwind CSS v4** — CSS-first config, no `tailwind.config`. Tokens live in `src/app/globals.css` (`@theme inline` + `:root` / `.dark` variables)
- **shadcn/ui** — preset `beEgoVTk`: `radix-luma` style, zinc base colour, Hugeicons for new components (older site code still uses lucide). Primitives in `src/components/ui/`, which import `cn` from shadcn's `cn` package. Add new ones with `npx shadcn@latest add <name>`. `typography.tsx` is custom, not from the registry.
- **Design happens in code, not Figma.** The shadcn preset tokens in `globals.css` are the source of truth. Fonts are the exception: always Matter (sans/headings) and DM Mono. Never let shadcn swap in Inter or another `next/font`.
- **GSAP** for animation
- **next-themes** for light/dark (class-based, defaults to system)
- **DatoCMS** via `@datocms/cda-client` and `react-datocms` (structured text rendering)

## Commands

```bash
npm run dev     # local dev server on http://localhost:3000
npm run build   # production build — run before pushing to catch type/build errors
npm run lint    # eslint
```

There is no test suite.

## Deployment

- GitHub: `lukemauricejermy/jermy.design`, default branch `main`
- Vercel deploys automatically from GitHub: pushing to `main` deploys to production; other branches/PRs get preview deployments
- Environment variables must be set in Vercel as well as in `.env.local`

## Environment

`.env.local` (gitignored — never commit it):

- `DATOCMS_API_TOKEN` — Content Delivery API, published content. Default for every query
- `DATOCMS_PREVIEW_API_TOKEN` — CDA with draft access. Only used to show draft featured cases on the homepage

## Project structure

```
src/
  app/
    layout.tsx            Root layout: PreLoader + ThemeProvider
    page.tsx              Homepage (force-dynamic): Header, Hero, SocialProof, FeaturedCases, Values, Footer
    work/page.tsx         Case study index
    work/[slug]/page.tsx  Case study template
    globals.css           Tailwind import, design tokens, light/dark variables
    fonts.css             Matter (sans) + DM Mono (mono)
  components/
    ui/                   shadcn primitives
    case-study/           Case study sections (hero, overview, callouts, related, rich-text)
    animations/           FadeUp, TextReveal, StaggerChildren
  lib/
    datocms.ts            performRequest() — the single entry point for Dato queries
    queries/              GraphQL query strings + matching TS types
    animation-config.ts   Shared durations, easings, distances, delays, staggers
  hooks/
    useAnimationTimeline.ts
```

## Conventions

### Data fetching (DatoCMS)

- Fetch in **server components** with `performRequest<T>({ query, variables })` from `@/lib/datocms`. Don't call the Dato client directly.
- Queries are plain GraphQL template strings. Larger ones live in `src/lib/queries/` with hand-written TS interfaces next to them (see `case-study.ts`); small ones can sit at the top of the component.
- When adding a field in Dato, update both the query and its TS interface.
- Dato images are served from `www.datocms-assets.com` (allowed in `next.config.ts` for `next/image`).
- Drafts: `FeaturedCases` uses the preview token with `includeDrafts: true` and shows unpublished featured cases as "coming soon" (detected via a null `_publishedAt`). Keep other pages on published content only.
- Missing records → `notFound()`.

### Components & styling

- Server components by default; add `"use client"` only where needed (animation, theme toggles, interactivity). Pattern: server wrapper fetches data → client component animates (e.g. `Values` → `ValuesClient`).
- Use `cn()` from `@/lib/utils` to merge classes.
- Use design tokens (`bg-background`, `text-muted-foreground`, `bg-chip-surface`, etc.), not raw colours. New tokens go in `globals.css` under both `:root` and `.dark`, then get mapped in `@theme inline`.
- Every change must look right in **both light and dark mode** and across mobile / tablet / desktop.
- Nested rounded elements use the concentric radius tokens (`--radius-inner-gap-*`) so inner radius = outer radius − gap.
- Header and case study hero share layout spacing variables (`--header-*`, `--hero-*`) in `globals.css`; change them together.
- Page layout: content sits in a `relative z-10` wrapper above a fixed `Footer`, with a spacer sized by `--footer-height` so the footer is revealed on scroll. New pages should follow the same structure as `src/app/page.tsx` and `src/app/work/[slug]/page.tsx`.

### Animation

- Use GSAP. Pull timings and easings from `@/lib/animation-config` rather than hard-coding numbers, so motion stays consistent.
- Prefer the reusable wrappers in `@/components/animations` before writing custom timelines.
- Kill timelines / tweens on unmount.

## Workflow

- Make changes on a branch for anything non-trivial; small tweaks can go straight to `main` if asked.
- Run `npm run build` before committing.
- Check visual changes in the browser (light + dark, narrow + wide) before calling them done.
