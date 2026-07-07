import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(scriptDir, "../.env");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    process.env[key] = trimmed.slice(eq + 1);
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const url = new URL(databaseUrl);
const dbName = decodeURIComponent(url.pathname.replace(/^\//, ""));
if (!dbName) {
  console.error("DATABASE_URL must include a database name");
  process.exit(1);
}

url.pathname = "/postgres";
const adminClient = new pg.Client({ connectionString: url.toString() });

try {
  await adminClient.connect();
  const existing = await adminClient.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName],
  );
  if (existing.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
    console.log(`Created database "${dbName}"`);
  } else {
    console.log(`Database "${dbName}" already exists`);
  }
} catch (err) {
  console.error("Failed to set up local database");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await adminClient.end().catch(() => {});
}
