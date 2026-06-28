import { performRequest } from "@/lib/datocms";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { CaseStudyHero } from "@/components/case-study/case-study-hero";
import { CaseStudyOverview } from "@/components/case-study/case-study-overview";
import { CaseStudyCallouts } from "@/components/case-study/case-study-callouts";
import {
  CASE_STUDY_QUERY,
  type CaseStudyQueryResult,
} from "@/lib/queries/case-study";

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { caseStudy } = await performRequest<CaseStudyQueryResult>({
    query: CASE_STUDY_QUERY,
    variables: { slug },
  });

  if (!caseStudy) {
    notFound();
  }

  return (
    <main>
      <div className="relative z-10 pointer-events-none">
        <div className="pointer-events-auto bg-background">
          <Header />
          <CaseStudyHero
            title={caseStudy.title}
            backgroundColour={caseStudy.heroBackgroundColour?.hex ?? null}
            logo={caseStudy.clientLogo}
            imagery={caseStudy.heroImagery}
            imageryMobile={caseStudy.heroImageryMobile}
          />
          <CaseStudyOverview caseStudy={caseStudy} />
          <CaseStudyCallouts callouts={caseStudy.callouts} />
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
