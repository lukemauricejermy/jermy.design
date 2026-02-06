import { performRequest } from "@/lib/datocms";
import Link from "next/link";
import Image from "next/image";

const CASE_STUDIES_QUERY = `
  query CaseStudies {
    allCaseStudies {
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

export default async function WorkPage() {
  const { allCaseStudies } = await performRequest<QueryResult>({
    query: CASE_STUDIES_QUERY,
  });

  return (
    <main className="min-h-screen p-8 md:p-24">
      <div className="max-w-4xl space-y-8">
        <h1 className="text-4xl font-semibold tracking-tight">Work</h1>
        
        <div className="grid gap-8">
          {allCaseStudies.map((study) => (
            <Link
              key={study.id}
              href={`/work/${study.slug}`}
              className="group block"
            >
              <article className="space-y-4">
                {study.coverImage && (
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src={study.coverImage.url}
                      alt={study.coverImage.alt || study.title}
                      className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <h2 className="text-2xl font-medium group-hover:underline">
                  {study.title}
                </h2>
                {study.excerpt && (
                  <p className="text-muted-foreground">{study.excerpt}</p>
                )}
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}