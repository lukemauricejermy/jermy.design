import { executeQuery } from "@datocms/cda-client";

export async function performRequest<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const result = await executeQuery(query, {
    token: process.env.DATOCMS_API_TOKEN!,
    variables,
  });
  return result as T;
}