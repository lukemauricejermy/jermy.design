import Link from "next/link";
import { performRequest } from "@/lib/datocms";
import Image from "next/image";
import { H2, Lead } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
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
      clientLogo {
        url
        alt
        width
        height
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
      clientLogo {
        url
        alt
        width
        height
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
  clientLogo: {
    url: string;
    alt: string | null;
    width: number | null;
    height: number | null;
  } | null;
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
 * The tile is the whole visual: no card around it. A 4:3 field of the
 * project's brand colour with the client logo centred on it. Temporary: the
 * cover images crop badly in these tiles, so logos stand in until there are
 * better covers; a case without a logo falls back to its cover, fitted.
 * Without a brand colour the field is the muted surface.
 */
/**
 * Tile art composed from the project's real UI (exported from its Figma file
 * at 3x into public/images/cases/<slug>-vN/). Sizes and positions are in
 * container units of the tile, so the composition holds at any size.
 */
function VemiArt() {
  const dir = "/images/cases/vemi-v1";
  // Three account cards, straight, spaced and staggered beside the screen.
  // Width 40cqw makes each 17.5cqw tall; 3cqw between them.
  const cards = [
    { src: "card-expected", left: 47, top: 8.25, delay: 0 },
    { src: "card-deposit", left: 54, top: 28.75, delay: 60 },
    { src: "card-goal", left: 47, top: 49.25, delay: 120 },
  ];
  return (
    <>
      {/* The dark dashboard, cropped by the tile's bottom edge. */}
      <div
        className="absolute top-[8.25cqw] left-[7cqw] w-[34cqw] transition-transform duration-700 ease-out group-hover:-translate-y-[1cqw]"
      >
        <div className="overflow-hidden rounded-[2.8cqw]">
          <Image
            src={`${dir}/dashboard-dark.png`}
            alt="Vemi dashboard in dark mode, showing total savings and three savings accounts"
            width={1179}
            height={3198}
            sizes="(min-width: 640px) 20vw, 40vw"
            className="h-auto w-full"
          />
        </div>
      </div>
      {/* Account cards in three of their states. The exports carry the dark
          canvas in their corners, so each is clipped to the card's own radius. */}
      {cards.map((card) => (
        <div
          key={card.src}
          className="absolute w-[40cqw] transition-transform duration-700 ease-out group-hover:-translate-y-[1.2cqw]"
          style={{
            left: `${card.left}cqw`,
            top: `${card.top}cqw`,
            transitionDelay: `${card.delay}ms`,
          }}
        >
          <Image
            src={`${dir}/${card.src}.png`}
            alt=""
            width={1083}
            height={474}
            sizes="(min-width: 640px) 25vw, 50vw"
            className="h-auto w-full"
            style={{ clipPath: "inset(0.15% round 1.45cqw)" }}
          />
        </div>
      ))}
    </>
  );
}

function FoundgoodArt() {
  const dir = "/images/cases/foundgood-v1";
  // The dashboard is a wide desktop screen, so the tile shows a tall crop of
  // its left side (sidebar, headline KPI, start of the donut): the image is
  // drawn wider than its window and anchored top-left.
  const cropWidth = 440; // source px of the 937px-wide screenshot: ends before the 2nd KPI
  const widgets = [
    // src, intrinsic size, left, top (cqw); width 44cqw
    { src: "kpi", w: 594, h: 254, left: 49, top: 15, delay: 0 },
    { src: "map", w: 2184, h: 1150, left: 53, top: 36.8, delay: 80 },
  ];
  return (
    <>
      <div className="absolute top-[8.25cqw] left-[7cqw] h-[80cqw] w-[38cqw] overflow-hidden rounded-[1.6cqw] transition-transform duration-700 ease-out group-hover:-translate-y-[1cqw]">
        <Image
          src={`${dir}/dashboard.png`}
          alt="Foundgood funder dashboard: initiatives funded, SDGs and countries supported, and initiatives by category"
          width={937}
          height={1600}
          sizes="(min-width: 640px) 40vw, 80vw"
          className="max-w-none"
          style={{ width: `${(38 * 937) / cropWidth}cqw`, height: "auto" }}
        />
      </div>
      {widgets.map((wg) => (
        <div
          key={wg.src}
          className="absolute w-[44cqw] transition-transform duration-700 ease-out group-hover:-translate-y-[1.2cqw]"
          style={{ left: `${wg.left}cqw`, top: `${wg.top}cqw`, transitionDelay: `${wg.delay}ms` }}
        >
          <Image
            src={`${dir}/${wg.src}.png`}
            alt=""
            width={wg.w}
            height={wg.h}
            sizes="(min-width: 640px) 25vw, 50vw"
            className="h-auto w-full"
            // The exports carry the canvas grey in their corners.
            style={{ clipPath: "inset(0.3% round 1cqw)" }}
          />
        </div>
      ))}
    </>
  );
}

const TILE_ART: Record<string, () => React.ReactNode> = {
  vemi: VemiArt,
  foundgood: FoundgoodArt,
};

function BrandTile({ study, overlay }: { study: CaseStudy; overlay?: string }) {
  const Art = TILE_ART[study.slug];
  const brand = study.heroBackgroundColour?.hex;
  return (
    <div
      className="@container relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-muted"
      style={brand ? { backgroundColor: brand } : undefined}
    >
      {Art ? (
        <Art />
      ) : study.clientLogo ? (
        // Every logo the same height (16% of the tile); width follows its
        // shape, capped so wide wordmarks keep a margin.
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-[1.04]">
          <Image
            src={study.clientLogo.url}
            alt={study.clientLogo.alt || `${study.title} logo`}
            width={study.clientLogo.width ?? 480}
            height={study.clientLogo.height ?? 160}
            className="h-[16%] w-auto max-w-[70%] object-contain"
          />
        </div>
      ) : (
        study.coverImage && (
          <Image
            src={study.coverImage.url}
            alt={study.coverImage.alt || study.title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        )
      )}
      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <span className="type-label text-foreground">{overlay}</span>
        </div>
      )}
    </div>
  );
}

/** Title with the year badge beside it, then a short line, on the page. */
function CaseStudyText({ study }: { study: CaseStudy }) {
  const year = study.year?.trim();
  const short = SHORT_LINES[study.slug] ?? study.excerpt;
  return (
    <div className="flex flex-col gap-2 pt-6 md:pt-8">
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

function PublishedCaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link href={`/work/${study.slug}`} className="group block select-none">
      <BrandTile study={study} />
      <CaseStudyText study={study} />
    </Link>
  );
}

function DraftCaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <div className="block select-none">
      <BrandTile study={study} overlay="Full case coming soon" />
      <CaseStudyText study={study} />
    </div>
  );
}

// Placeholder when fewer than 4 featured case studies
function PlaceholderCard() {
  return (
    <div>
      <div className="aspect-[4/3] rounded-[var(--radius-card)] bg-muted" />
      <div className="pt-6 md:pt-8">
        <h3 className="type-title text-muted-foreground">Coming soon</h3>
      </div>
    </div>
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
      <div className="max-w-[90rem] mx-auto flex flex-col gap-32">
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
          className="featured-cases grid w-full grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 md:gap-y-24"
        >
          {cards}
        </StaggerChildren>
      </div>
    </section>
  );
}
