import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { dawarichGet, type QueryParams } from "./dawarich.js";

function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function errorResult(error: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: error instanceof Error ? error.message : String(error),
      },
    ],
    isError: true,
  };
}

function registerGetTool(
  server: McpServer,
  name: string,
  description: string,
  inputSchema: z.ZodRawShape,
  path: (args: Record<string, unknown>) => string,
  params: (args: Record<string, unknown>) => QueryParams,
) {
  server.registerTool(
    name,
    { description, inputSchema },
    async (args: Record<string, unknown>) => {
      try {
        return jsonResult(await dawarichGet(path(args), params(args)));
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}

export function buildServer(): McpServer {
  const server = new McpServer({
    name: "dawarich-mcp-server",
    version: "0.1.0",
  });

  registerGetTool(
    server,
    "get_health",
    "Check the health/status of the Dawarich instance.",
    {},
    () => "/api/v1/health",
    () => ({}),
  );

  registerGetTool(
    server,
    "get_user",
    "Get the current Dawarich user profile and settings.",
    {},
    () => "/api/v1/user",
    () => ({}),
  );

  registerGetTool(
    server,
    "get_statistics",
    "Get aggregated location statistics (distance, countries, cities), optionally limited to a date range.",
    {
      start_date: z
        .string()
        .optional()
        .describe("Start date, ISO 8601 (e.g. 2025-01-01)"),
      end_date: z.string().optional().describe("End date, ISO 8601"),
    },
    () => "/api/v1/statistics",
    (a) => ({
      start_date: a.start_date as string | undefined,
      end_date: a.end_date as string | undefined,
    }),
  );

  registerGetTool(
    server,
    "get_monthly_statistics",
    "Get per-month statistics (distance, points, countries, cities) for a year.",
    {
      year: z.number().int().optional().describe("Year, e.g. 2025"),
    },
    () => "/api/v1/statistics/monthly",
    (a) => ({ year: a.year as number | undefined }),
  );

  registerGetTool(
    server,
    "get_points",
    "Get raw tracked location points within a time range. Can return large results; use pagination.",
    {
      start_at: z
        .string()
        .describe("Range start, ISO 8601 (e.g. 2025-01-01T00:00:00Z)"),
      end_at: z.string().describe("Range end, ISO 8601"),
      page: z.number().int().optional().describe("Page number (default 1)"),
      per_page: z
        .number()
        .int()
        .optional()
        .describe("Points per page (default 100)"),
      order: z
        .enum(["asc", "desc"])
        .optional()
        .describe("Sort order by timestamp"),
      slim: z
        .boolean()
        .optional()
        .describe("Return slim points (only coordinates and timestamp)"),
    },
    () => "/api/v1/points",
    (a) => ({
      start_at: a.start_at as string,
      end_at: a.end_at as string,
      page: a.page as number | undefined,
      per_page: a.per_page as number | undefined,
      order: a.order as string | undefined,
      slim: a.slim as boolean | undefined,
    }),
  );

  registerGetTool(
    server,
    "get_visits",
    "List detected visits (stays at places) with location, duration and start/end times.",
    {
      start_date: z.string().optional().describe("Start date, ISO 8601"),
      end_date: z.string().optional().describe("End date, ISO 8601"),
    },
    () => "/api/v1/visits",
    (a) => ({
      start_date: a.start_date as string | undefined,
      end_date: a.end_date as string | undefined,
    }),
  );

  registerGetTool(
    server,
    "get_places",
    "List the user's saved places with visit counts and tags.",
    {
      filter: z
        .enum(["all", "manual", "confirmed", "tagged"])
        .optional()
        .describe("Filter places"),
    },
    () => "/api/v1/places",
    (a) => ({ filter: a.filter as string | undefined }),
  );

  registerGetTool(
    server,
    "get_places_nearby",
    "Find saved places near a coordinate.",
    {
      latitude: z.number().describe("Latitude"),
      longitude: z.number().describe("Longitude"),
      radius: z.number().optional().describe("Radius in km (default 0.5)"),
      limit: z.number().int().optional().describe("Max results (default 10)"),
    },
    () => "/api/v1/places/nearby",
    (a) => ({
      latitude: a.latitude as number,
      longitude: a.longitude as number,
      radius: a.radius as number | undefined,
      limit: a.limit as number | undefined,
    }),
  );

  registerGetTool(
    server,
    "search_locations",
    "Search the location history for visited locations near a coordinate.",
    {
      lat: z.number().describe("Latitude"),
      lon: z.number().describe("Longitude"),
      limit: z.number().int().optional().describe("Max results (default 50)"),
      date_from: z.string().optional().describe("Start date, YYYY-MM-DD"),
      date_to: z.string().optional().describe("End date, YYYY-MM-DD"),
      radius_override: z
        .number()
        .int()
        .optional()
        .describe("Search radius in meters"),
    },
    () => "/api/v1/locations",
    (a) => ({
      lat: a.lat as number,
      lon: a.lon as number,
      limit: a.limit as number | undefined,
      date_from: a.date_from as string | undefined,
      date_to: a.date_to as string | undefined,
      radius_override: a.radius_override as number | undefined,
    }),
  );

  registerGetTool(
    server,
    "get_trips",
    "List trips with dates, countries and cities.",
    {
      start_date: z.string().optional().describe("Start date, ISO 8601"),
      end_date: z.string().optional().describe("End date, ISO 8601"),
    },
    () => "/api/v1/trips",
    (a) => ({
      start_date: a.start_date as string | undefined,
      end_date: a.end_date as string | undefined,
    }),
  );

  registerGetTool(
    server,
    "get_tracks",
    "List tracks (continuous movement segments) with distance and start/end dates.",
    {
      year: z.number().int().optional().describe("Filter by year"),
    },
    () => "/api/v1/tracks",
    (a) => ({ year: a.year as number | undefined }),
  );

  registerGetTool(
    server,
    "get_areas",
    "List user-defined areas (name, center coordinate, radius).",
    {},
    () => "/api/v1/areas",
    () => ({}),
  );

  registerGetTool(
    server,
    "get_visited_cities",
    "List countries and cities visited within a date range.",
    {
      start_at: z.string().describe("Start date, YYYY-MM-DD"),
      end_at: z.string().describe("End date, YYYY-MM-DD"),
    },
    () => "/api/v1/countries/visited_cities",
    (a) => ({
      start_at: a.start_at as string,
      end_at: a.end_at as string,
    }),
  );

  registerGetTool(
    server,
    "get_insights",
    "Get yearly travel insights: totals, activity heatmap, streaks.",
    {
      year: z.number().int().optional().describe("Year (default: current)"),
      distance_unit: z.enum(["km", "mi"]).optional().describe("Distance unit"),
    },
    () => "/api/v1/insights",
    (a) => ({
      year: a.year as number | undefined,
      distance_unit: a.distance_unit as string | undefined,
    }),
  );

  return server;
}
