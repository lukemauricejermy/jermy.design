import type { StructuredTextGraphQlResponse } from "react-datocms";

export const CASE_STUDY_QUERY = `
  query CaseStudy($slug: String!) {
    caseStudy(filter: { slug: { eq: $slug } }) {
      id
      title
      slug
      excerpt
      coverImage {
        url
        alt
        width
        height
      }

      # Hero
      heroBackgroundColour {
        hex
      }
      clientLogo {
        url
        alt
        width
        height
      }
      heroImagery {
        url
        alt
        width
        height
      }
      heroImageryMobile {
        url
        alt
        width
        height
      }

      # Overview — info chips
      role
      year
      projectDuration
      methodologies {
        id
        name
      }
      technologies {
        id
        name
      }

      # Overview — text
      overviewText {
        value
      }

      # Overview — scores
      scores {
        ... on ScoreValueRecord {
          id
          value
          scoreItem {
            id
            name
            scoreItemPosition
            group {
              id
              name
              scorePosition
            }
          }
        }
      }

      # Callouts
      callouts {
        ... on CalloutRecord {
          id
          title
          blocks {
            __typename
            ... on ImageBlockRecord {
              id
              caption
              image {
                url
                alt
                width
                height
              }
            }
            ... on ImageTextBlockRecord {
              id
              caption
              layout
              image {
                url
                alt
                width
                height
              }
              body {
                value
              }
            }
          }
        }
      }

      # Outcome-first template (switches on when outcomeHeadline is set)
      outcomeHeadline
      summary
      facts {
        ... on CaseFactRecord {
          label
          value
        }
      }
      impact {
        ... on CaseImpactRecord {
          value
          label
        }
      }
      quoteText
      quoteRole
      startingPoint
      myRole
      highlightsHeading
      highlights {
        ... on CaseHighlightRecord {
          id
          title
          body
          images {
            url
            alt
            title
            width
            height
          }
        }
      }
      waysOfWorking {
        ... on CaseWayOfWorkingRecord {
          id
          title
          body
          visual
          quoteText
          quoteRole
          image {
            url
            alt
            title
            width
            height
          }
        }
      }
      principlesHeading
      principles {
        ... on CasePrincipleRecord {
          title
          body
        }
      }
      nextTime
      nextTimeHeading

      # Related projects (same tile as the homepage's featured cases)
      relatedCaseStudy1 {
        id
        title
        slug
        excerpt
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
        coverImage {
          url
          alt
        }
      }
      relatedCaseStudy2 {
        id
        title
        slug
        excerpt
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
        coverImage {
          url
          alt
        }
      }
    }
  }
`;

export interface DatoImage {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export interface TermTag {
  id: string;
  name: string | null;
}

export interface ScoreGroup {
  id: string;
  name: string | null;
  scorePosition: number | null;
}

export interface ScoreItem {
  id: string;
  name: string | null;
  scoreItemPosition: number | null;
  group: ScoreGroup | null;
}

export interface ScoreValue {
  id: string;
  value: number | null;
  scoreItem: ScoreItem | null;
}

export interface ImageBlock {
  __typename: "ImageBlockRecord";
  id: string;
  caption: string | null;
  image: DatoImage | null;
}

export interface ImageTextBlock {
  __typename: "ImageTextBlockRecord";
  id: string;
  caption: string | null;
  // Dato enum API values: "first" (image-left, default) | "second" (image-right)
  layout: string | null;
  image: DatoImage | null;
  body: StructuredTextGraphQlResponse | null;
}

export type CalloutBlock = ImageBlock | ImageTextBlock;

export interface Callout {
  id: string;
  title: string | null;
  blocks: CalloutBlock[];
}

export interface RelatedCaseStudy {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  year: string | null;
  heroBackgroundColour: { hex: string } | null;
  clientLogo: {
    url: string;
    alt: string | null;
    width: number | null;
    height: number | null;
  } | null;
  coverImage: {
    url: string;
    alt: string | null;
  } | null;
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: DatoImage | null;

  heroBackgroundColour: { hex: string } | null;
  clientLogo: DatoImage | null;
  heroImagery: DatoImage | null;
  heroImageryMobile: DatoImage | null;

  role: string | null;
  year: string | null;
  projectDuration: string | null;
  methodologies: TermTag[];
  technologies: TermTag[];

  overviewText: StructuredTextGraphQlResponse | null;

  scores: ScoreValue[];
  callouts: Callout[];

  relatedCaseStudy1: RelatedCaseStudy | null;
  relatedCaseStudy2: RelatedCaseStudy | null;

  // Outcome-first template
  outcomeHeadline: string | null;
  summary: string | null;
  facts: { label: string; value: string }[];
  impact: { value: string; label: string }[];
  quoteText: string | null;
  quoteRole: string | null;
  startingPoint: string | null;
  myRole: string | null;
  highlightsHeading: string | null;
  highlights: {
    id: string;
    title: string;
    body: string | null;
    images: CaseAsset[];
  }[];
  waysOfWorking: {
    id: string;
    title: string;
    body: string | null;
    visual: string | null;
    quoteText: string | null;
    quoteRole: string | null;
    image: CaseAsset | null;
  }[];
  principlesHeading: string | null;
  principles: { title: string; body: string | null }[];
  nextTime: string | null;
  nextTimeHeading: string | null;
}

/** An image with its caption in the asset title. */
export interface CaseAsset {
  url: string;
  alt: string | null;
  title: string | null;
  width: number | null;
  height: number | null;
}

export interface CaseStudyQueryResult {
  caseStudy: CaseStudy | null;
}
