import { performRequest } from "@/lib/datocms";
import fs from "fs";
import path from "path";
import ValuesClient from "./ValuesClient";

const VALUES_QUERY = `
  query Values {
    allValues(orderBy: order_ASC) {
      id
      title
      key
      description
      order
    }
  }
`;

type Value = {
  id: string;
  title: string;
  key: string;
  description: string | null;
  order: number | null;
};

type QueryResult = {
  allValues: Value[];
};

// Fallback values when DatoCMS model doesn't exist or returns empty
const FALLBACK_VALUES: Value[] = [
  { id: "1", title: "Learning never stops", key: "learning-stops", description: "I believe in continuous growth and curiosity.", order: 0 },
  { id: "2", title: "Play the game", key: "play-the-game", description: "Understanding the rules helps you innovate within them.", order: 1 },
  { id: "3", title: "Good enough", key: "good-enough", description: "Perfect is the enemy of done. Ship, learn, iterate.", order: 2 },
  { id: "4", title: "People are the hardest part", key: "people-hardest-part", description: "Design is a team sport. Relationships matter.", order: 3 },
  { id: "5", title: "Those who mind don't matter", key: "those-who-mind", description: "Stay true to your vision while staying open to feedback.", order: 4 },
  { id: "6", title: "Ask difficult questions", key: "difficult-questions", description: "The best outcomes come from asking the right questions.", order: 5 },
];

function loadSvgContent(key: string): string | null {
  try {
    const normalizedKey = key.replace(/_/g, "-").toLowerCase();
    const svgPath = path.join(
      process.cwd(),
      "public",
      "images",
      "values",
      `${normalizedKey}.svg`
    );
    return fs.readFileSync(svgPath, "utf-8");
  } catch {
    return null;
  }
}

export default async function Values() {
  const { allValues } = await performRequest<QueryResult>({
    query: VALUES_QUERY,
  }).catch(() => ({ allValues: [] }));

  const values = allValues?.length ? allValues : FALLBACK_VALUES;

  const valuesWithSvgs = values.map((v) => ({
    ...v,
    svgContent: loadSvgContent(v.key) ?? "",
  }));

  return <ValuesClient values={valuesWithSvgs} />;
}
