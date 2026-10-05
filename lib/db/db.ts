import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "./schema";

// Required for Node.js environments (Next.js serverless functions, scripts)
if (!neonConfig.webSocketConstructor) {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/kintsugi_db";

const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });


