import { performRequest } from "@/lib/datocms";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { CaseStudyHero } from "@/components/case-study/case-study-hero";
import { HERO_ART } from "@/components/case-study/hero-art";
import { CaseStudyOverview } from "@/components/case-study/case-study-overview";
import { CaseStudyCallouts } from "@/components/case-study/case-study-callouts";
import { CaseStudyRelated } from "@/components/case-study/case-study-related";
import {
  CaseStudyOutcome,
  CaseStudyStory,
  CaseStudyQuote,
  CaseStudyDecisions,
  CaseStudyHowWeWorked,
  CaseStudyHeldTrue,
} from "@/components/case-study/case-study-outcome";
import { outcomeCaseFromDato } from "@/lib/outcome-case";
import {
  CASE_STUDY_QUERY,
  type CaseStudyQueryResult,
} from "@/lib/queries/case-study";

export default async function CaseStudyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  // Local only: /work/<slug>?preview=1 reads unpublished Dato changes, to
  // check a case before publishing it. Production always reads published.
  const preview =
    process.env.NODE_ENV === "development" && (await searchParams).preview === "1";

  const { caseStudy } = await performRequest<CaseStudyQueryResult>({
    query: CASE_STUDY_QUERY,
    variables: { slug },
    ...(preview && {
      includeDrafts: true,
      token: process.env.DATOCMS_PREVIEW_API_TOKEN,
    }),
  });

  if (!caseStudy) {
    notFound();
  }

  // Cases with an outcome headline use the outcome-first template; the rest
  // keep the original overview + callouts layout until they're rewritten.
  const outcome = outcomeCaseFromDato(caseStudy);

  return (
    <main className="case-study-page">
      <div className="relative z-10 pointer-events-none">
        <div className="pointer-events-auto bg-background">
          <Header />
          <CaseStudyHero
            title={caseStudy.title}
            backgroundColour={caseStudy.heroBackgroundColour?.hex ?? null}
            logo={caseStudy.clientLogo}
            imagery={caseStudy.heroImagery}
            imageryMobile={caseStudy.heroImageryMobile}
            art={HERO_ART[slug]?.()}
          />
          {outcome ? (
            <>
              <CaseStudyOutcome draft={outcome} />
              <CaseStudyStory draft={outcome} />
              <CaseStudyQuote draft={outcome} />
              <CaseStudyDecisions draft={outcome} />
              <CaseStudyHowWeWorked draft={outcome} />
              <CaseStudyHeldTrue draft={outcome} />
            </>
          ) : (
            <>
              <CaseStudyOverview caseStudy={caseStudy} />
              <CaseStudyCallouts callouts={caseStudy.callouts} />
            </>
          )}
          <CaseStudyRelated
            related={[caseStudy.relatedCaseStudy1, caseStudy.relatedCaseStudy2]}
          />
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
