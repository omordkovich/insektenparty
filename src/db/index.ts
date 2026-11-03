import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

// The client is kept on globalThis so each server instance opens one
// connection pool - not one per query (on Vercel those piled up until the
// pooler refused new ones) and, in development, not one per hot reload.
// The connection string is stored with it:
// when .env.local changes (e.g. a new database password), Next reloads the
// env but would otherwise keep using the old client - every request would
// then fail with the stale password until the dev server is restarted.
const globalForDb = globalThis as unknown as {
  postgresClient?: ReturnType<typeof postgres>;
  drizzleDb?: Db;
  connectionString?: string;
};

function createDb(): Db {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env.local file.",
    );
  }

  if (globalForDb.connectionString !== connectionString && globalForDb.postgresClient) {
    void globalForDb.postgresClient.end({ timeout: 5 });
    globalForDb.postgresClient = undefined;
    globalForDb.drizzleDb = undefined;
  }

  const client =
    globalForDb.postgresClient ??
    postgres(connectionString, { prepare: false });

  const db = globalForDb.drizzleDb ?? drizzle(client, { schema });

  globalForDb.postgresClient = client;
  globalForDb.drizzleDb = db;
  globalForDb.connectionString = connectionString;

  return db;
}

export function getDb(): Db {
  return createDb();
}
