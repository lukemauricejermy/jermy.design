import Link from "next/link";
import { performRequest } from "@/lib/datocms";
import Image from "next/image";
import { H2, Lead } from "@/components/ui/typography";
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

const ALL_CASE_STUDIES_QUERY = `
  query AllCaseStudies {
    allCaseStudies(first: 100) {
      id
      title
      slug
      excerpt
      featured
      _publishedAt
      coverImage {
        url
        alt
      }
    }
  }
`;

const FEATURED_CASE_STUDIES_PUBLISHED_QUERY = `
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
  featured?: boolean;
  _publishedAt?: string | null;
  coverImage: {
    url: string;
    alt: string | null;
  } | null;
};

type AllCaseStudiesQueryResult = {
  allCaseStudies: CaseStudy[];
};

type QueryResult = {
  allCaseStudies: CaseStudy[];
};

const FEATURED_SLOTS = 4;

function isCaseStudyPublished(study: CaseStudy) {
  // With includeDrafts, draft-only records have no publication date
  if (study._publishedAt != null) return true;
  // Published-only API responses never include unpublished records
  if (study._publishedAt === undefined) return true;
  return false;
}

function markPublishedStudies(studies: CaseStudy[]): CaseStudy[] {
  return studies.map((study) => ({
    ...study,
    _publishedAt: study._publishedAt ?? "published",
  }));
}

async function fetchPublishedFeatured(): Promise<CaseStudy[]> {
  try {
    const { allCaseStudies } = await performRequest<QueryResult>({
      query: FEATURED_CASE_STUDIES_PUBLISHED_QUERY,
    });
    return markPublishedStudies(allCaseStudies);
  } catch {
    return [];
  }
}

async function fetchAllCaseStudiesWithDrafts(): Promise<CaseStudy[] | null> {
  const previewToken = process.env.DATOCMS_PREVIEW_API_TOKEN;
  if (!previewToken) return null;

  try {
    const { allCaseStudies } = await performRequest<AllCaseStudiesQueryResult>({
      query: ALL_CASE_STUDIES_QUERY,
      includeDrafts: true,
      excludeInvalid: false,
      token: previewToken,
    });
    return allCaseStudies;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[FeaturedCases] Could not fetch draft case studies. In Dato → Project settings → API tokens, enable “Content Delivery API: preview/draft” on DATOCMS_PREVIEW_API_TOKEN.",
        error instanceof Error ? error.message : error,
      );
    }
    return null;
  }
}

async function fetchFeaturedCaseStudies(): Promise<CaseStudy[]> {
  const publishedFeatured = await fetchPublishedFeatured();
  const allWithDrafts = await fetchAllCaseStudiesWithDrafts();

  if (!allWithDrafts) {
    return publishedFeatured;
  }

  const publishedIds = new Set(publishedFeatured.map((study) => study.id));
  const draftFeatured = allWithDrafts.filter(
    (study) => study.featured && !publishedIds.has(study.id),
  );

  return [...publishedFeatured, ...draftFeatured]
    .slice(0, FEATURED_SLOTS)
    .map((study) => ({
      ...study,
      _publishedAt: publishedIds.has(study.id)
        ? (study._publishedAt ?? "published")
        : null,
    }));
}

function CaseStudyCoverImage({ study }: { study: CaseStudy }) {
  return (
    <div className="aspect-video bg-muted relative rounded md:rounded-lg overflow-hidden">
      {study.coverImage ? (
        <div className="absolute inset-0">
          <Image
            src={study.coverImage.url}
            alt={study.coverImage.alt || study.title}
            width={600}
            height={338}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted" />
      )}
    </div>
  );
}

function CaseStudyCardContent({ study }: { study: CaseStudy }) {
  return (
    <>
      <CardContent className="pt-0 px-3 md:px-6">
        <CaseStudyCoverImage study={study} />
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
    </>
  );
}

function DraftCaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <div className="block h-full select-none">
      <Card className="overflow-hidden h-full flex flex-col rounded-2xl md:rounded-[var(--radius-card)] py-3 md:py-6">
        <CardContent className="pt-0 px-3 md:px-6">
          <div className="aspect-video bg-muted relative rounded md:rounded-lg overflow-hidden">
            {study.coverImage ? (
              <div className="absolute inset-0">
                <Image
                  src={study.coverImage.url}
                  alt={study.coverImage.alt || study.title}
                  width={600}
                  height={338}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted" />
            )}
            <div className="absolute inset-0 rounded md:rounded-lg bg-background/60 backdrop-blur-sm flex items-center justify-center pointer-events-none z-10">
              <span className="text-sm md:text-base leading-none font-medium text-foreground">
                Full case coming soon
              </span>
            </div>
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
    </div>
  );
}

function PublishedCaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link
      href={`/work/${study.slug}`}
      className="group block h-full select-none"
    >
      <Card className="overflow-hidden h-full flex flex-col rounded-2xl md:rounded-[var(--radius-card)] py-3 md:py-6 transition-shadow group-hover:shadow-md">
        <CaseStudyCardContent study={study} />
      </Card>
    </Link>
  );
}

// Placeholder card when fewer than 4 featured case studies
function PlaceholderCard() {
  return (
    <Card className="overflow-hidden h-full min-h-[280px] flex flex-col rounded-2xl md:rounded-[var(--radius-card)] py-3 md:py-6">
      <CardContent className="pt-0 px-3 md:px-6">
        <div className="aspect-video bg-muted rounded md:rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 rounded md:rounded-lg bg-background/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <span className="text-sm md:text-base leading-none font-medium text-foreground">
              Full case coming soon
            </span>
          </div>
        </div>
      </CardContent>
      <CardHeader className="px-3 md:px-6 pb-5 md:pb-7">
        <CardTitle className="text-muted-foreground font-normal">
          Coming soon
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

export default async function FeaturedCases() {
  const allCaseStudies = await fetchFeaturedCaseStudies();

  // Ensure we have 4 slots for the grid (fill with placeholders if needed)
  const slots = FEATURED_SLOTS;
  const cards = Array.from({ length: slots }, (_, i) => {
    const study = allCaseStudies[i];
    if (!study) {
      return <PlaceholderCard key={`placeholder-${i}`} />;
    }

    if (isCaseStudyPublished(study)) {
      return <PublishedCaseStudyCard key={study.id} study={study} />;
    }

    return <DraftCaseStudyCard key={study.id} study={study} />;
  });

  return (
    <section className="bg-background py-56 px-6">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-32">
        {/* Row 1: H2 on LEFT, Lead + Button on RIGHT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24">
          <H2 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-none tracking-tight border-none pb-0 overflow-hidden">
            <TextReveal
              triggerOnScroll={true}
              delay={0}
              duration={750}
              stagger={0.015}
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
          className="featured-cases grid grid-cols-1 sm:grid-cols-2 gap-8 w-full"
        >
          {cards}
        </StaggerChildren>
      </div>
    </section>
  );
}
