import { executeQuery } from "@datocms/cda-client";

export async function performRequest<T>({
  query,
  variables = {},
  includeDrafts = false,
  excludeInvalid = true,
  token,
}: {
  query: string;
  variables?: Record<string, unknown>;
  includeDrafts?: boolean;
  excludeInvalid?: boolean;
  token?: string;
}): Promise<T> {
  const result = await executeQuery(query, {
    token: token ?? process.env.DATOCMS_API_TOKEN!,
    variables,
    includeDrafts,
    excludeInvalid,
  });
  return result as T;
}