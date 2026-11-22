---
name: case-study-writing
description: Structure, interview and write jermy.design case studies outcome-first. Use when planning, interviewing Luke about, drafting, restructuring or reviewing any case study (Vemi, Foundgood, Upright Music, Sourcewhere, TechSoup and future ones), or when changing the case study model in Dato.
---

# Case study writing for jermy.design

Cases are written for a hiring manager or founder deciding whether to talk to
Luke about a head of design or principal role. They skim (NN/g: hiring managers
rarely read a portfolio word for word; Tom Scott: decisions in the first ~10
seconds, 50+ portfolios a sitting). So every case answers, in this order:

1. **What changed because of this work?** (outcome)
2. **What did Luke own?** (role, team, scope)
3. **How did he get there?** (the few decisions that mattered, with proof)
4. **What did it teach him?** (judgement, skills, what he'd do differently)

Copy follows the `voice-and-tone` skill. This skill sets the shape and the
interview that gathers the raw material.

## Principles (from the research)

- **Outcome first, visuals second.** Lead with what the work led to; the craft
  sections earn their place by explaining *how*. (Hiring managers say they
  rarely advance candidates whose cases don't mention impact.)
- **Real numbers, or honest direction.** Use figures where they exist. Where
  they're confidential or unmeasured, give direction, scale and why it
  mattered ("cut design reviews from two hours to 15 minutes", "used by 500+
  foundations"). Never invent a number. Qualitative outcomes count.
- **Role, explicitly.** Title, team shape, what Luke did himself versus led
  or influenced. Credit the team by name or role; claiming everything reads as
  ego (Tom Scott).
- **The work before the work.** At lead level, framing, alignment and
  reframing the ask are most of the job. Show them, not just screens.
- **Decisions, not process.** No double-diamond tour, personas or journey maps
  for the sake of it. Two to four pivotal decisions, each with the trade-off
  and the evidence.
- **Constraints and detours.** Budget, regulation, team size, things that
  didn't work. Their absence suggests you weren't close to the work.
- **Short.** A few lines per section. Visual craft carries the rest.
- **Consistent shape.** Same sections in the same order on every case, so a
  reader learns where to look.

## The structure

Each section maps to a field in Dato (see "Dato model" below).

1. **Outcome headline** — one sentence, the result, not the project.
   "Took an ethical bank from brand to an app-store-ready MVP in three months",
   not "Vemi mobile app". Six to 14 words. Also feeds the work tile's short line.
2. **Facts** — client, what it is (one line), Luke's role, team, duration, year,
   platform. Scannable, sidebar or strip.
3. **Impact** — two to four results. Each: a value ("500+", "15 min", "MVP in
   3 months") and a plain label. Optional client or colleague quote.
4. **The starting point** — two or three sentences: the situation, what was
   at stake, the real problem (and how it was reframed, if it was).
5. **My role** — what Luke owned, who he worked with, the balance of
   strategy, hands-on craft and leadership. One short paragraph.
6. **Key decisions** (2–4) — each a titled section: the decision, why, the
   trade-off, then the visual proof (screens, flows, system, artefacts).
   Replaces the current "callouts". The crunchy UX lives here.
7. **What it taught me** — two or three lessons or skills sharpened, and what
   he'd do differently. Honest, specific, not a skills cloud.
8. **Related cases.**

## The interview

Walk through this with Luke one case at a time, a few questions per message,
conversationally. Push gently for specifics: numbers, names, dates, before and
after, a moment. Note what's confidential. Record answers verbatim in
`notes/cases/<slug>.md` (gitignored; the repo is public) before drafting.

**0. Context**
- In a sentence, what is the product and who is it for?
- Who was the client or employer, and how did you come to the project?
- When, how long, and what platform(s)?

**1. Outcome**
- If this project hadn't happened, what would be different today?
- What did it lead to? Launch, funding, revenue, users, adoption, retention,
  time or cost saved, risk reduced, a team or practice that outlasted you.
- Any numbers, even rough or relative? Which can be published?
- What did the client, users or the team say about it? Any quote we can use,
  and attributed how?
- What are you proudest of, and is that the same as what mattered most to the
  business?

**2. Starting point**
- What was the situation when you arrived? What was broken, missing or at stake?
- What were you asked to do, and was that the real problem? Did you reframe it?
- What constraints shaped everything (budget, time, regulation, tech, team,
  politics)?

**3. Role and team**
- Your title, and what you actually did (honestly, beyond the title).
- Team shape: who, how many, which disciplines, who led what?
- What did you do hands-on, what did you lead, and what did you influence
  without owning?
- Who were the key stakeholders, and how did you work with them?

**4. Key decisions** (repeat for 2–4)
- What was the decision or turning point?
- What were the options, and why this one? What did you give up?
- How did you get alignment? Who disagreed?
- What happened as a result?
- What visual shows it best (Figma frame, flow, before/after, artefact,
  photo)? Where is it?

**5. Detours**
- What didn't work, or what would you undo?
- Biggest surprise along the way?

**6. Lessons and skills**
- What did this project teach you that you still use?
- Which skills did it stretch (craft, systems, research, facilitation,
  leadership, commercial)?
- What would you do differently with hindsight?

**7. Visuals and assets**
- Hero image or tile art: what single picture says "this is the product"?
- Which screens, flows or artefacts are shareable? Anything under NDA?
- Brand colour and logo files?

## Writing it up

- Draft each section from the notes, in Luke's voice, then show the draft in
  full before anything goes into Dato.
- Headline and impact first; if they're weak, go back to the interview, don't
  polish around the gap.
- Check against the `voice-and-tone` checklist, then this one:
  - [ ] Could a reader get the outcome from the headline and impact alone?
  - [ ] Is Luke's role explicit, with the team credited?
  - [ ] Does each key decision name a trade-off and show proof?
  - [ ] Any number that isn't real, or any claim that overstates the role?
  - [ ] Is anything confidential?
- Write to Dato as a draft; Luke publishes.

## Dato model

The case study model (`case_study`) has today: `title`, `slug`, `excerpt`,
`year`, `role`, `project_duration`, `overview_text` (structured text),
`callouts` (blocks of `callout` → `image_text_block` / `image_block`),
`scores`, `methodologies`, `technologies`, `hero_*` images, `cover_image`,
`client_logo`, `hero_background_colour`, `featured`, related links.

Additions for this structure (agree with Luke before changing the schema):
`outcome_headline` (string), `impact` (blocks of `impact_stat`: value, label),
`quote` (block: text, name, role), `team` (string), `platform` (string),
`starting_point` (structured text), `my_role` (structured text),
`lessons` (structured text). `callouts` stays as the key decisions (title,
then image + text blocks). `overview_text` is retired once its content moves.

## Sources

- NN/g, UX design portfolios: https://www.nngroup.com/articles/ux-design-portfolios/
- Tom Scott, 6 green flags in portfolios: https://verifiedinsider.substack.com/p/6-green-flags-in-portfolios
- Tom Scott, learnings from reviewing 500+ applications: https://verifiedinsider.substack.com/p/learnings-from-reviewing-500-design
- Toptal, UX portfolio tips from recruiters: https://www.toptal.com/designers/ux/ux-portfolio-tips-recruiter
- HubSpot, portfolio reviews done right: https://product.hubspot.com/blog/portfolio-reviews-done-right
- Mobbin customer-story patterns (Stripe, Attio, HubSpot, Clay, Jasper): outcome
  headline, two to four stat tiles, facts sidebar, one quote, then the story.
