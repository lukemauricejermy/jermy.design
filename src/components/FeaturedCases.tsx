import Link from "next/link";
import { performRequest } from "@/lib/datocms";
import Image from "next/image";
import { H2, Lead } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
      year
      heroBackgroundColour {
        hex
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
      year
      heroBackgroundColour {
        hex
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
  year: string | null;
  heroBackgroundColour: { hex: string } | null;
};

/**
 * Short lines for the cards: a scannable few words in place of the full
 * excerpt (which stays on the case study page). Temporary: these belong in
 * Dato as a short "tagline" field on the case study; until then, keyed by slug.
 */
const SHORT_LINES: Record<string, string> = {
  vemi: "Ethical banking, from zero to MVP",
  foundgood: "Measuring impact for philanthropy",
  sourcewhere: "Finding the unfindable in luxury fashion",
  techsoup: "A tech marketplace for nonprofits",
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

/**
 * The brand tile: the cover image on the project's own colour (which shows
 * while it loads, and around any image that doesn't fill). Without a brand
 * colour it falls back to the muted surface. Radius is concentric with the
 * card padding.
 */
function BrandTile({ study, overlay }: { study: CaseStudy; overlay?: string }) {
  const brand = study.heroBackgroundColour?.hex;
  return (
    <div
      className="relative aspect-[16/10] overflow-hidden rounded-[calc(var(--radius-card)-0.75rem)] bg-muted md:rounded-[calc(var(--radius-card)-1rem)]"
      style={brand ? { backgroundColor: brand } : undefined}
    >
      {study.coverImage && (
        <Image
          src={study.coverImage.url}
          alt={study.coverImage.alt || study.title}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}
      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <span className="type-label text-foreground">{overlay}</span>
        </div>
      )}
    </div>
  );
}

/** Title with the year badge beside it, then a short line. */
function CaseStudyCardText({ study }: { study: CaseStudy }) {
  const year = study.year?.trim();
  const short = SHORT_LINES[study.slug] ?? study.excerpt;
  return (
    <div className="flex flex-1 flex-col gap-2 px-3 pt-6 pb-4 md:px-4 md:pt-8 md:pb-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="type-title min-w-0 text-balance">{study.title}</h3>
        {year && (
          <Badge variant="secondary" size="lg">
            {year}
          </Badge>
        )}
      </div>
      {short && <p className="type-lead text-balance text-muted-foreground">{short}</p>}
    </div>
  );
}

const cardClass =
  "flex h-full flex-col gap-0 overflow-hidden rounded-[var(--radius-card)] p-3 md:p-4";

function PublishedCaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link href={`/work/${study.slug}`} className="group block h-full select-none">
      <Card className={cn(cardClass, "transition-shadow group-hover:shadow-md")}>
        <BrandTile study={study} />
        <CaseStudyCardText study={study} />
      </Card>
    </Link>
  );
}

function DraftCaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <div className="block h-full select-none">
      <Card className={cardClass}>
        <BrandTile study={study} overlay="Full case coming soon" />
        <CaseStudyCardText study={study} />
      </Card>
    </div>
  );
}

// Placeholder card when fewer than 4 featured case studies
function PlaceholderCard() {
  return (
    <Card className={cn(cardClass, "min-h-[280px]")}>
      <div className="relative aspect-[16/10] rounded-[calc(var(--radius-card)-0.75rem)] bg-muted md:rounded-[calc(var(--radius-card)-1rem)]" />
      <div className="px-3 pt-6 pb-4 md:px-4 md:pt-8 md:pb-5">
        <h3 className="type-title text-muted-foreground">Coming soon</h3>
      </div>
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
          <H2 className="text-balance">
            <TextReveal
              triggerOnScroll={true}
              delay={0}
              duration={750}
              stagger={0.015}
              easing={animationEasings.robust}
            >
              {`From early-stage startups to enterprise tech`}
            </TextReveal>
          </H2>
          <FadeUp
            triggerOnScroll={true}
            duration={animationDurations.default}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
            className="flex flex-col gap-8"
          >
            <Lead>
              I&apos;ve spent the last 20 years creating digital products —
              in-house, as a consultant, and as the founder of my own design
              studio. I&apos;ve worked across industries and alongside some
              exceptional teams and people.
            </Lead>
            <Lead>
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
