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
  description: { value: unknown } | null;
  order: number | null;
};

type QueryResult = {
  allValues: Value[];
};

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

  const valuesWithSvgs = values.map((v) => ({
    ...v,
    svgContent: loadSvgContent(v.key) ?? "",
  }));

  return <ValuesClient values={valuesWithSvgs} />;
}
