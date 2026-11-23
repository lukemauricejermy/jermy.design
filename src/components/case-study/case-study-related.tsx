import { H2 } from "@/components/ui/typography";
import { DealIn } from "@/components/animations";
import { PublishedCaseStudyCard } from "@/components/FeaturedCases";
import type { RelatedCaseStudy } from "@/lib/queries/case-study";

interface CaseStudyRelatedProps {
  related: (RelatedCaseStudy | null)[];
}

// Related cases use the same tile as the homepage's featured cases (brand
// colour field, logo or tile art, title, year and short line), dealt in the
// same way.
export function CaseStudyRelated({ related }: CaseStudyRelatedProps) {
  const studies = related.filter((study): study is RelatedCaseStudy =>
    Boolean(study)
  );

  if (studies.length === 0) return null;

  return (
    <section className="overflow-x-clip bg-background px-6 py-56">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col">
        {/* Same rhythm as the case sections: heading, a rule, then the content. */}
        <H2 className="w-full pb-8 text-center md:pb-12 md:text-left">
          Carry on through the archives
        </H2>

        <DealIn className="featured-cases grid w-full grid-cols-1 gap-x-8 gap-y-16 border-t border-border pt-16 sm:grid-cols-2 md:pt-20">
          {studies.map((study) => (
            <PublishedCaseStudyCard key={study.id} study={study} />
          ))}
        </DealIn>
      </div>
    </section>
  );
}
