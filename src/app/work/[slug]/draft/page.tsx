import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { performRequest } from "@/lib/datocms";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { CaseStudyHero } from "@/components/case-study/case-study-hero";
import { HERO_ART } from "@/components/case-study/hero-art";
import { CaseStudyRelated } from "@/components/case-study/case-study-related";
import {
  CaseStudyOutcome,
  CaseStudyStory,
  CaseStudyDecisions,
  CaseStudyHeldTrue,
  CaseStudyQuote,
  CaseStudyHowWeWorked,
} from "@/components/case-study/case-study-outcome";
import { loadCaseDraft } from "@/lib/outcome-case";
import {
  CASE_STUDY_QUERY,
  type CaseStudyQueryResult,
} from "@/lib/queries/case-study";

// Review copy of a case study in the outcome-first structure. Hero, imagery
// and related cases come from the live Dato record; the words come from the
// local, gitignored draft file, so this 404s anywhere that file is missing
// (including production). Never indexed.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Draft case study",
  robots: { index: false, follow: false },
};

export default async function CaseStudyDraftPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const draft = await loadCaseDraft(slug);
  if (!draft) notFound();

  const { caseStudy } = await performRequest<CaseStudyQueryResult>({
    query: CASE_STUDY_QUERY,
    variables: { slug },
  });
  // A case that isn't in Dato yet takes its hero from the draft file.
  if (!caseStudy && !draft.hero) notFound();
  const heroImage = draft.hero?.imagery
    ? { url: draft.hero.imagery.url, alt: draft.hero.imagery.caption, width: draft.hero.imagery.width, height: draft.hero.imagery.height }
    : null;
  const hero = {
    title: caseStudy?.title ?? draft.title ?? slug,
    backgroundColour: caseStudy?.heroBackgroundColour?.hex ?? draft.hero?.colour ?? null,
    logo: caseStudy?.clientLogo ?? null,
    imagery: caseStudy?.heroImagery ?? heroImage,
    imageryMobile: caseStudy?.heroImageryMobile ?? heroImage,
  };

  return (
    <main className="case-study-page">
      <div className="relative z-10 pointer-events-none">
        <div className="pointer-events-auto bg-background">
          <Header />
          <CaseStudyHero {...hero} art={HERO_ART[slug]?.()} />
          <CaseStudyOutcome draft={draft} />
          <CaseStudyStory draft={draft} />
          <CaseStudyQuote draft={draft} />
          <CaseStudyDecisions draft={draft} />
          <CaseStudyHowWeWorked draft={draft} />
          <CaseStudyHeldTrue draft={draft} />
          {caseStudy && (
            <CaseStudyRelated
              related={[caseStudy.relatedCaseStudy1, caseStudy.relatedCaseStudy2]}
            />
          )}
        </div>
        {/* Spacer: matches footer height so fixed footer is revealed as content scrolls away */}
        <div
          className="pointer-events-none"
          style={{ minHeight: "var(--footer-height, 500px)" }}
          aria-hidden
        />
      </div>
      <Footer />
    </main>
  );
}
