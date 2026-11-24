# jermy.design

Personal design portfolio. Next.js App Router site, content from DatoCMS, deployed on Vercel.

## Stack

- **Next.js 16** (App Router, React Server Components) + **React 19**, TypeScript
- **Tailwind CSS v4** — CSS-first config, no `tailwind.config`. Tokens live in `src/app/globals.css` (`@theme inline` + `:root` / `.dark` variables)
- **shadcn/ui** — preset `beEgoVTk`: `radix-luma` style, zinc base colour. **All icons are Hugeicons** (`@hugeicons/react` + `@hugeicons/core-free-icons`); lucide has been removed, so don't reintroduce it. Primitives in `src/components/ui/`, which import `cn` from shadcn's `cn` package. Add new ones with `npx shadcn@latest add <name>`. `typography.tsx` is custom, not from the registry.
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

Dev CSS quirk: Turbopack serves `globals.css` one save behind, and a `touch` doesn't count (it hashes content). After editing it, make a second throwaway content change (add, then remove, a comment) and the latest version lands. Edit `globals.css` on its own, not in the same instant as other files. The persistent dev cache is off in `next.config.ts`; if CSS still looks stale after a restart, delete `.next/dev`.

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
  proxy.ts                Edge proxy: puts the visitor's city and country (Vercel geo IP) in cookies for the preloader greeting and its flag
  app/
    layout.tsx            Root layout: PreLoader + ThemeProvider
    page.tsx              Homepage (force-dynamic): Header, Hero, SocialProof, FeaturedCases, Values, Footer
    work/page.tsx         Case study index
    work/[slug]/page.tsx  Case study template (outcome-first when the case has an outcome headline, else the original layout)
    work/[slug]/draft/    Local-only review of a case being written, from notes/cases/<slug>.draft.json
    globals.css           Tailwind import, design tokens, light/dark variables
    fonts.css             Matter (sans) + DM Mono (mono)
  components/
    ui/                   shadcn primitives
    case-study/           Case study sections: hero, related, case-study-outcome (the outcome-first sections), and the original overview/callouts
    animations/           FadeUp, TextReveal, StaggerChildren, DealIn
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
- Case lists (homepage, `/work`) are newest first by the `year` field, via `byNewest` in `lib/case-order.ts`; published cases come before "coming soon" drafts.
- Case studies: the outcome-first template reads the "Outcome-first case" fieldset on `case_study` (blocks `case_fact`, `case_impact`, `case_highlight`, `case_way_of_working`, `case_principle`; text fields split into paragraphs on blank lines; image captions come from the asset title). `outcomeCaseFromDato` in `lib/outcome-case.ts` maps it for the components. In development, `/work/<slug>?preview=1` reads unpublished changes. Luke publishes in Dato. Art direction that isn't content lives in code, keyed by slug: `HERO_ART` (`case-study/hero-art.tsx`) for a bespoke hero, and `CASE_SHOWCASES` (`lib/case-showcases.ts`) for framed screens under a highlight, matched by its title. The showcase presents real screens in phone or browser frames on a flat colour, no labels.

### Components & styling

- Server components by default; add `"use client"` only where needed (animation, theme toggles, interactivity). Pattern: server wrapper fetches data → client component animates (e.g. `Values` → `ValuesClient`).
- Use `cn()` from `@/lib/utils` to merge classes. It's shadcn's `cn` extended to understand the type scale. UI components must import it from `@/lib/utils`, not from `"cn"`; after `shadcn add`, repoint the new file's import.

### Copy

- Any words on the site (headings, intros, case lines, buttons, microcopy) follow the `voice-and-tone` skill in `.claude/skills/voice-and-tone/`: Luke's voice (plain, confident, a bit wry), UX writing fundamentals from NN/g and GOV.UK, house style (British English, sentence case, no em dashes in copy) and a review checklist.
- Case studies follow the `case-study-writing` skill in `.claude/skills/case-study-writing/`: outcome-first structure, the interview used to gather each case, and planned Dato fields. Interview notes and drafts live in `notes/cases/` (gitignored, because the repo is public).

### Typography

- The type scale lives in `globals.css` as `type-*` utilities: `display`, `headline`, `title-lg`, `title`, `title-sm`, `lead`, `body`, `body-long`, `label`, `small`, `caption`, `overline`. Each sets size, line height, tracking and weight, with responsive steps built in.
- Use `<Typography variant="…" as="…">` (or the `H1`–`H4` / `Lead` / `P` shortcuts) or the `type-*` class directly. Choose the variant by role and set the element separately.
- **Don't add `text-xl`, `leading-none`, `tracking-tight` etc. to set type.** Pick a type style. Leading, tracking and weight modifiers still compose if genuinely needed. A new size means a new token in `globals.css` + `TYPE_STYLES` in `lib/utils.ts`.
- **Spacing is tuned for Matter, not inherited from shadcn/Inter.** Following Displaay's own Matter specimen: tracking tightens as size grows and opens as it shrinks (about −2% at 60px, 0 around 30px, +1.5% at 16px, +2.5% at 12px). Line height tightens as size grows. Raw Tailwind `text-*` sizes carry the same tracking via `--text-*--letter-spacing` in `@theme`. Retune against displaay.net/typeface/matter, not generic defaults.
- **Display and all title styles** (`hero`, `display`, `headline`, `title-lg`, `title`, `title-sm`) are SemiBold with tight line height (0.97–1.1) and negative tracking. Display is 0.97 / −4%, matched to Displaay's type tester; the others taper to about −2% at 24px. All values are em or ratios, so they scale with font size. Don't loosen them back. A `type-*` class overrides any earlier weight, leading or tracking class (e.g. CardTitle's base `font-medium`).
- Matter metrics: cap 0.70em, x-height 0.504em, ink ~0.9em, ascent/descent box 0.95/0.24. Weights shipped: 400/500/600 (`font-synthesis: none`).
- `TextReveal` inherits line height from its parent. Each word's mask extends 0.25em below the line (descenders) and 0.12em to each side (glyphs overhang under tight tracking), with matching negative margins, so parents need no clipping. Never put `overflow-hidden` on a reveal heading.
- **Headings, lead and body are fluid** (`clamp()`): each grows in a straight line from its phone size at 375px through the old desktop size at ~1280px, capped near 1920px (e.g. headline 36 → 64 → 80, lead 18 → 24, body 16 → 18). Label, small, caption and overline stay fixed. Keep new sizes in the same form so the /design-system readouts can parse the range.
- Known off-scale one-offs (left as-is deliberately): footer `Lead`.
- Fonts: Matter (400/500/600) from `public/fonts`, and DM Mono via `next/font` (`preload: false`) for `type-overline`, `font-mono` and code.

### Artwork

- Style: Pixar-style 3D in the Plocka visual language (soft rounded forms, clean matte materials, light from the upper left), but character portraits are front three-quarter, not isometric.
- Generate with `node scripts/generate-art.mjs` (Gemini `gemini-3-pro-image`; style refs in `art/reference/style/`, character ref in `art/reference/character/`). Use `--from` a picked image for consistent variations and `--size 2K` for anything shown large. Output goes to `art/generated/` (gitignored); review before using.
- Cut out with `swift scripts/cutout.swift in.png out.png [--keep-frame]`. It removes the background locally, keys the soft edge band on the flat background colour and decontaminates edge pixels (no grey halo). For light/dark pairs, use `--keep-frame` and crop both to the same box so they line up.
- **Use `--bg green` for anything with props**, and for night versions too: generate the picture, then ask Gemini to "change only the background colour" with `--bg green`. The cutout keys on green excess, despills and chokes the edge, giving clean edges with nothing dropped. On grey or near-black, Vision loses floating props and dark-on-dark shading.
- Value illustrations live in `public/images/values/<version>/<key>.png` plus `<key>-dark.png`, cut with `--keep-frame` (full 2048 square) so the character is the same size on every card. Every value needs a night version; pictures with a screen (arcade, laptop) light the face with it. Bump `ILLUSTRATION_VERSION` in `Values.tsx` when replacing images. The old hand-drawn SVGs are in `art/reference/values-hand-drawn/`.
- Gemini won't reliably mirror a pose: flip the image yourself (`sips -f horizontal`), then ask it to re-light only.
- When replacing an image in `public/`, use a new filename. Next's image optimiser caches by URL.

### Hero status and greeting flag

- The hero's current status (`STATUS` in `Hero.tsx`: text, company and its link, e.g. "Currently head of design at VISIT" linking to visit.com) sits under the headline on phones and pinned bottom left on desktop, level with the bottom of the portrait. The headline fit reserves its room. Update the string when the role changes.
- The preloader greeting badge shows the visitor's flag on the left: circle-flags (MIT, HatScripts), self-hosted in `public/flags/<iso>.svg`. The pill wraps it with an even 0.25rem inset (plus the border) so the flag sits concentric in the rounded end. No country (local dev), no flag.

### Hero and footer video

- The loop is built from two anchored halves so the face-on moment can't drift off-model: typing still → wave still (`generate-video.mjs --from A --to W --duration 4`) and wave → typing (`--from W --to A`). The wave still is made with `generate-art.mjs` and checked by eye first. Prompts lock the eyes ("small, solid dark eyes, no whites, never widened"); without anchoring, the model swaps in round eyes with whites whenever he faces the camera.
- Join: re-encode each half to constant 24fps, `xfade` 0.25s at the join, then crossfade the last 0.5s into the first 0.5s for the loop point. Check with a frame-difference scan (`tblend` + `signalstats`) that no frame jumps more than normal motion.
- Night: relight each half with `--previous <half>.interaction.txt` (a follow-up turn on the stored interaction, which is allowed in the UK, unlike uploading video) and assemble it with the identical joins, so it matches frame for frame. Never fake it with masks.
- Colour-match the relit halves: compare the subject's mean RGB on the last frame of half one and the first frame of half two (same pose) and apply per-channel gains (`colorchannelmixer`) to half two before joining; separately relit halves come back at different brightness.
- Key both with `python3 scripts/key-video.py --name hero-loop-vN day.mp4:light night.mp4:dark`. Key the night video by its own green when its background stayed clean: relighting subtly reshapes things like the cap, so the day matte doesn't fit (`:dark:light` is only for a dimmed backdrop). The key is green dominance relative to brightness, with edge colour recovery, despill and a 2px choke. One shared crop, VP9-alpha WebM + HEVC-alpha MOV, posters. Version the names.
- The footer loop (sip, a satisfied look, a wave) is built the same way: rest still → wave still (5s, the sip happens in between) and wave → rest (3s). Its stills are square, padded to 16:9 with their own green. He faces the camera throughout, and prompts pin the mug to one hand ("never changes hands"); without that, the model passes it between hands mid-air.
- `LoopPortrait` (used by `HeroPortrait` and the footer) picks the encode on the client, shows posters until the video plays, keeps them for reduced motion, and syncs the incoming loop on theme change. About $0.07/s of video at 720p.

### Design system page

- `/design-system` (noindex) documents colour, type, radius, motion and components, rendered live from the real tokens and components. Its readouts (hex values, type steps, radii) are computed in the browser from the CSS, so they don't need updating by hand.
- When adding a component or token, add it to the page too (`src/app/design-system/`).
- Use design tokens (`bg-background`, `text-muted-foreground`, `bg-chip-surface`, etc.), not raw colours. New tokens go in `globals.css` under both `:root` and `.dark`, then get mapped in `@theme inline`.
- Every change must look right in **both light and dark mode** and across mobile / tablet / desktop.
- **Stacked layouts centre their text.** Wherever a section stacks into one column (phones, and tablets for sections that stack until `lg`), headings, intros, buttons and small print are centre-aligned; side-by-side layouts stay left-aligned (`text-center md:text-left`, `lg:` where the section stacks until `lg`). Text inside cards stays left.
- **Large screens scale the whole UI**: the root font size is 16px up to 1440px wide, then grows to 22px at 2560px (`html` in `globals.css`). So size layout in rem, not px (content widths are `max-w-[90rem]`, not `max-w-[1440px]`), or it won't grow with everything else.
- Nested rounded elements use the concentric radius tokens (`--radius-inner-gap-*`) so inner radius = outer radius − gap.
- Header and case study hero share layout spacing variables (`--header-*`, `--hero-*`) in `globals.css`; change them together.
- Page layout: content sits in a `relative z-10` wrapper above a fixed `Footer`, with a spacer sized by `--footer-height` so the footer is revealed on scroll. New pages should follow the same structure as `src/app/page.tsx` and `src/app/work/[slug]/page.tsx`.

### Animation

- Use GSAP. Pull timings and easings from `@/lib/animation-config` rather than hard-coding numbers, so motion stays consistent.
- Prefer the reusable wrappers in `@/components/animations` before writing custom timelines.
- `DealIn` deals cards in as they reach the screen (case tiles): a calmer cousin of the values deck, tuned in `dealIn` in animation-config. No fades and no overshoot: motion lands firmly (power4.out), the site's character is in the choreography, not in bounce.
- Kill timelines / tweens on unmount.

## Workflow

- Make changes on a branch for anything non-trivial; small tweaks can go straight to `main` if asked.
- Run `npm run build` before committing.
- Check visual changes in the browser (light + dark, narrow + wide) before calling them done.
