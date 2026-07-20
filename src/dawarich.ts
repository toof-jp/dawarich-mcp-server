import { config } from "./config.js";

export type QueryParams = Record<
  string,
  string | number | boolean | undefined
>;

export async function dawarichGet(
  path: string,
  params: QueryParams = {},
): Promise<unknown> {
  const url = new URL(`${config.dawarichBaseUrl}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.dawarichApiKey}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Dawarich API error: ${response.status} ${response.statusText} for GET ${path}: ${body.slice(0, 500)}`,
    );
  }

  return response.json();
}
