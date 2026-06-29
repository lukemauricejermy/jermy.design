import Link from "next/link";
import Image from "next/image";
import { H2 } from "@/components/ui/typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StaggerChildren, TextReveal } from "@/components/animations";
import {
  animationDurations,
  animationEasings,
  animationDistances,
} from "@/lib/animation-config";
import type { RelatedCaseStudy } from "@/lib/queries/case-study";

interface CaseStudyRelatedProps {
  related: (RelatedCaseStudy | null)[];
}

function RelatedCard({ study }: { study: RelatedCaseStudy }) {
  return (
    <Link
      href={`/work/${study.slug}`}
      className="group block h-full select-none"
    >
      <Card className="h-full flex flex-col overflow-hidden rounded-2xl md:rounded-[var(--radius-card)] py-3 md:py-6 transition-shadow group-hover:shadow-md">
        <CardContent className="pt-0 px-3 md:px-6">
          <div className="aspect-video bg-muted relative rounded md:rounded-lg overflow-hidden">
            {study.coverImage ? (
              <Image
                src={study.coverImage.url}
                alt={study.coverImage.alt || study.title}
                width={600}
                height={338}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted" />
            )}
          </div>
        </CardContent>
        <CardHeader className="gap-1.5 px-3 md:px-6 pb-5 md:pb-7">
          <CardTitle className="text-2xl font-medium leading-8">
            {study.title}
          </CardTitle>
          {study.excerpt && (
            <CardDescription className="text-base leading-5 text-foreground">
              {study.excerpt}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}

export function CaseStudyRelated({ related }: CaseStudyRelatedProps) {
  const studies = related.filter((study): study is RelatedCaseStudy =>
    Boolean(study)
  );

  if (studies.length === 0) return null;

  return (
    <section className="bg-background px-6 py-56">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-16">
        {/* Full-width section title */}
        <H2 className="w-full overflow-hidden border-none pb-0 text-4xl font-medium leading-none tracking-tight md:text-5xl lg:text-6xl">
          <TextReveal
            triggerOnScroll
            duration={750}
            stagger={0.015}
            easing={animationEasings.robust}
          >
            Carry on through the archives
          </TextReveal>
        </H2>

        <StaggerChildren
          triggerOnScroll
          delayBetween={80}
          duration={animationDurations.default}
          distance={animationDistances.default}
          easing={animationEasings.smooth}
          className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2"
        >
          {studies.map((study) => (
            <RelatedCard key={study.id} study={study} />
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
