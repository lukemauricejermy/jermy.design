import { performRequest } from "@/lib/datocms";
import Link from "next/link";
import Image from "next/image";
import { H2, Lead } from "@/components/ui/typography";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FadeUp, StaggerChildren, TextReveal } from "@/components/animations";
import {
  animationDurations,
  animationEasings,
  animationDistances,
} from "@/lib/animation-config";

const FEATURED_CASE_STUDIES_QUERY = `
  query FeaturedCaseStudies {
    allCaseStudies(filter: { featured: { eq: true } }, first: 4) {
      id
      title
      slug
      excerpt
      coverImage {
        url
        alt
      }
    }
  }
`;

type CaseStudy = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: {
    url: string;
    alt: string | null;
  } | null;
};

type QueryResult = {
  allCaseStudies: CaseStudy[];
};

// Placeholder card when fewer than 4 featured case studies
function PlaceholderCard() {
  return (
    <Card className="overflow-hidden h-full min-h-[280px] flex flex-col">
      <CardHeader className="flex-1">
        <CardTitle className="text-muted-foreground font-normal">
          Coming soon
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center" />
      </CardContent>
    </Card>
  );
}

export default async function FeaturedCases() {
  const { allCaseStudies } = await performRequest<QueryResult>({
    query: FEATURED_CASE_STUDIES_QUERY,
  }).catch(() => ({ allCaseStudies: [] }));

  // Ensure we have 4 slots for the grid (fill with placeholders if needed)
  const slots = 4;
  const cards = Array.from({ length: slots }, (_, i) => {
    const study = allCaseStudies[i];
    return study ? (
      <Link key={study.id} href={`/work/${study.slug}`} className="block h-full">
        <Card className="overflow-hidden h-full flex flex-col group transition-shadow hover:shadow-md">
          <CardHeader className="flex-1 gap-1.5">
            <CardTitle className="text-2xl font-medium leading-8">
              {study.title}
            </CardTitle>
            {study.excerpt && (
              <CardDescription className="text-base leading-5 text-foreground">
                {study.excerpt}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-hidden rounded-lg aspect-video bg-muted">
              {study.coverImage ? (
                <Image
                  src={study.coverImage.url}
                  alt={study.coverImage.alt || study.title}
                  width={600}
                  height={338}
                  className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted" />
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    ) : (
      <PlaceholderCard key={`placeholder-${i}`} />
    );
  });

  return (
    <section className="py-56 px-6">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-32">
        {/* Row 1: H2 on LEFT, Lead + Button on RIGHT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24">
          <H2 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-none tracking-tight border-none pb-0 overflow-hidden">
            <TextReveal
              triggerOnScroll={true}
              delay={0}
              duration={animationDurations.verySlow}
              stagger={0.025}
              easing={animationEasings.robust}
            >
              {`Design of every shape and size, from early stage startup to enterprise tech`}
            </TextReveal>
          </H2>
          <FadeUp
            triggerOnScroll={true}
            duration={animationDurations.default}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
            className="flex flex-col gap-8"
          >
            <Lead className="text-lg md:text-xl leading-7 md:leading-[28px]">
              I&apos;ve spent the last 20 years creating digital products —
              in-house, as a consultant, and as the founder of my own design
              studio. I&apos;ve worked across industries and alongside some
              exceptional teams and people.
            </Lead>
            <Lead className="text-lg md:text-xl leading-7 md:leading-[28px]">
              This portfolio is a curated snapshot of that work — a selection of
              the projects I&apos;m most proud of and able to share publicly.
            </Lead>
            <div>
              <Link
                href="/work"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                See all cases
              </Link>
            </div>
          </FadeUp>
        </div>

        {/* Row 2: 2x2 grid of cards spanning full width */}
        <StaggerChildren
          triggerOnScroll={true}
          delayStart={0}
          delayBetween={80}
          duration={animationDurations.default}
          distance={animationDistances.default}
          easing={animationEasings.smooth}
          className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full"
        >
          {cards}
        </StaggerChildren>
      </div>
    </section>
  );
}
