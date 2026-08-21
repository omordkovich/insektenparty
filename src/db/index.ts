import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  postgresClient?: ReturnType<typeof postgres>;
  drizzleDb?: Db;
};

function createDb(): Db {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env.local file.",
    );
  }

  const client =
    globalForDb.postgresClient ??
    postgres(connectionString, { prepare: false });

  const db = globalForDb.drizzleDb ?? drizzle(client, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.postgresClient = client;
    globalForDb.drizzleDb = db;
  }

  return db;
}

export function getDb(): Db {
  return createDb();
}
