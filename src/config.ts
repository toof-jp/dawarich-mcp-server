function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

export const config = {
  dawarichBaseUrl: requireEnv("DAWARICH_BASE_URL").replace(/\/+$/, ""),
  dawarichApiKey: requireEnv("DAWARICH_API_KEY"),
  port: Number(process.env.MCP_PORT ?? "3000"),
};
