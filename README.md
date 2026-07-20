# dawarich-mcp-server

MCP server for [Dawarich](https://dawarich.app), exposing read-only location history tools over the Streamable HTTP transport.

Designed to run behind an OAuth-terminating proxy (e.g. mcp-gate); the server itself performs no client authentication.

## Tools

| Tool | Dawarich API |
| --- | --- |
| `get_health` | `GET /api/v1/health` |
| `get_user` | `GET /api/v1/user` |
| `get_statistics` | `GET /api/v1/statistics` |
| `get_monthly_statistics` | `GET /api/v1/statistics/monthly` |
| `get_points` | `GET /api/v1/points` |
| `get_visits` | `GET /api/v1/visits` |
| `get_places` | `GET /api/v1/places` |
| `get_places_nearby` | `GET /api/v1/places/nearby` |
| `search_locations` | `GET /api/v1/locations` |
| `get_trips` | `GET /api/v1/trips` |
| `get_tracks` | `GET /api/v1/tracks` |
| `get_areas` | `GET /api/v1/areas` |
| `get_visited_cities` | `GET /api/v1/countries/visited_cities` |
| `get_insights` | `GET /api/v1/insights` |

## Configuration

| Variable | Required | Description |
| --- | --- | --- |
| `DAWARICH_BASE_URL` | yes | Base URL of the Dawarich instance (e.g. `http://dawarich.dawarich.svc.cluster.local:3000`) |
| `DAWARICH_API_KEY` | yes | Dawarich API key (sent as `Authorization: Bearer`) |
| `MCP_PORT` | no | Listen port (default `3000`) |

## Endpoints

- `POST /mcp` — MCP Streamable HTTP endpoint (stateless)
- `GET /health` — liveness/readiness probe

## Development

```sh
bun install
DAWARICH_BASE_URL=... DAWARICH_API_KEY=... bun run dev
bun run typecheck
```

## Docker

Images are published to `ghcr.io/toof-jp/dawarich-mcp-server` by CI on pushes to `main`.

```sh
docker run -p 3000:3000 \
  -e DAWARICH_BASE_URL=... \
  -e DAWARICH_API_KEY=... \
  ghcr.io/toof-jp/dawarich-mcp-server:latest
```
