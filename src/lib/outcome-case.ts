import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CaseAsset, CaseStudy } from "@/lib/queries/case-study";

// Case studies in the outcome-first structure (see the case-study-writing
// skill). Live cases come from Dato (outcomeCaseFromDato); drafts being
// written come from notes/cases/<slug>.draft.json, which is gitignored because
// the repo is public, so they only render locally at /work/<slug>/draft.

export interface DraftImage {
  url: string;
  caption: string;
  width: number;
  height: number;
}

export interface OutcomeCase {
  outcomeHeadline: string;
  summary: string;
  facts: { label: string; value: string }[];
  impact: { value: string; label: string }[];
  quote: { text: string; role: string } | null;
  status: string | null;
  startingPoint: string[];
  myRole: string[];
  howWeWorked: { title?: string; body: string; quote?: { text: string; role: string }; image?: DraftImage; visual?: "sprint" }[];
  decisionsHeading?: string;
  decisions: {
    title: string;
    body: string[];
    images: DraftImage[];
    placeholder?: string;
  }[];
  heldTrueHeading?: string;
  heldTrue: { title: string; body: string }[];
  nextTime: string | null;
  heldTrueImages: DraftImage[];
}

export async function loadCaseDraft(slug: string): Promise<OutcomeCase | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const file = path.join(process.cwd(), "notes", "cases", `${slug}.draft.json`);
  try {
    return JSON.parse(await readFile(file, "utf8")) as OutcomeCase;
  } catch {
    return null;
  }
}

const paragraphs = (text: string | null | undefined) =>
  (text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

function toImage(asset: CaseAsset | null): DraftImage | null {
  if (!asset?.width || !asset.height) return null;
  return {
    url: asset.url,
    caption: asset.title ?? asset.alt ?? "",
    width: asset.width,
    height: asset.height,
  };
}

/** Maps a Dato case to the template's shape, or null if it isn't set up for it. */
export function outcomeCaseFromDato(cs: CaseStudy): OutcomeCase | null {
  if (!cs.outcomeHeadline) return null;
  return {
    outcomeHeadline: cs.outcomeHeadline,
    summary: cs.summary ?? "",
    facts: cs.facts,
    impact: cs.impact,
    quote: cs.quoteText && cs.quoteRole ? { text: cs.quoteText, role: cs.quoteRole } : null,
    status: null,
    startingPoint: paragraphs(cs.startingPoint),
    myRole: paragraphs(cs.myRole),
    howWeWorked: cs.waysOfWorking.map((w) => ({
      title: w.title,
      body: w.body ?? "",
      image: toImage(w.image) ?? undefined,
      visual: w.visual === "sprint" ? "sprint" : undefined,
      quote: w.quoteText && w.quoteRole ? { text: w.quoteText, role: w.quoteRole } : undefined,
    })),
    decisionsHeading: cs.highlightsHeading ?? undefined,
    decisions: cs.highlights.map((h) => ({
      title: h.title,
      body: paragraphs(h.body),
      images: h.images.map(toImage).filter((i): i is DraftImage => i !== null),
    })),
    heldTrueHeading: cs.principlesHeading ?? undefined,
    heldTrue: cs.principles.map((p) => ({ title: p.title, body: p.body ?? "" })),
    nextTime: cs.nextTime,
    heldTrueImages: [],
  };
}
