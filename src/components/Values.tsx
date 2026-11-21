import { performRequest } from "@/lib/datocms";
import fs from "fs";
import path from "path";
import ValuesClient, {
  type StructuredTextData,
  type ValueIllustrationData,
} from "./ValuesClient";

const VALUES_QUERY = `
  query Values {
    allValues(orderBy: order_ASC) {
      id
      title
      key
      description {
        value
      }
      order
    }
  }
`;

type Value = {
  id: string;
  title: string;
  key: string;
  description: StructuredTextData;
  order: number | null;
};

type QueryResult = {
  allValues: Value[];
};

/**
 * Value illustration: public/images/values/<VERSION>/<key>.png (3D render,
 * background removed, full square frame so the character is the same size on
 * every card) and <key>-dark.png, the night version for dark mode. Size comes
 * from the PNG header. Bump VERSION when replacing images (Next's image
 * optimiser caches by URL).
 */
const ILLUSTRATION_VERSION = "v8";

function loadIllustration(key: string): ValueIllustrationData | null {
  const slug = key.replace(/_/g, "-").toLowerCase();
  const dir = path.join(process.cwd(), "public", "images", "values", ILLUSTRATION_VERSION);
  const file = path.join(dir, `${slug}.png`);
  if (!fs.existsSync(file)) return null;
  const header = fs.readFileSync(file).subarray(16, 24);
  const dark = fs.existsSync(path.join(dir, `${slug}-dark.png`));
  return {
    src: `/images/values/${ILLUSTRATION_VERSION}/${slug}.png`,
    darkSrc: dark ? `/images/values/${ILLUSTRATION_VERSION}/${slug}-dark.png` : undefined,
    width: header.readUInt32BE(0),
    height: header.readUInt32BE(4),
  };
}

export default async function Values() {
  let response: QueryResult;
  try {
    response = await performRequest<QueryResult>({
      query: VALUES_QUERY,
    });
  } catch (error) {
    console.error("Dato values fetch error:", error);
    response = { allValues: [] };
  }

  console.log("Dato values response:", response);
  console.log("Values count:", response?.allValues?.length);

  const values = response?.allValues ?? [];

  const valuesWithIllustrations = values.map((v) => ({
    ...v,
    illustration: loadIllustration(v.key),
  }));

  return <ValuesClient values={valuesWithIllustrations} />;
}
