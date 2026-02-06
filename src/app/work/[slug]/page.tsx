import { performRequest } from "@/lib/datocms";
import { notFound } from "next/navigation";

const CASE_STUDY_QUERY = `
  query CaseStudy($slug: String!) {
    caseStudy(filter: { slug: { eq: $slug } }) {
      id
      title
      slug
      excerpt
      coverImage {
        url
        alt
      }
      content {
        value
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
  content: {
    value: unknown;
  } | null;
};

type QueryResult = {
  caseStudy: CaseStudy | null;
};

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  const { caseStudy } = await performRequest<QueryResult>({
    query: CASE_STUDY_QUERY,
    variables: { slug },
  });

  if (!caseStudy) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8 md:p-24">
      <article className="max-w-3xl space-y-8">
        <header className="space-y-4">
          <h1 className="text-5xl font-semibold tracking-tight">
            {caseStudy.title}
          </h1>
          {caseStudy.excerpt && (
            <p className="text-xl text-muted-foreground">{caseStudy.excerpt}</p>
          )}
        </header>

        {caseStudy.coverImage && (
          <img
            src={caseStudy.coverImage.url}
            alt={caseStudy.coverImage.alt || caseStudy.title}
            className="w-full rounded-lg"
          />
        )}
      </article>
    </main>
  );
}