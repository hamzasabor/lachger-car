import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reuse one connection across invocations (important in serverless).
let client: ReturnType<typeof postgres> | null = null;

export async function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL manquante. Copiez la chaîne de connexion Supabase (Project Settings > Database > Connection string > Transaction pooler) dans les variables d'environnement Netlify."
    );
  }
  if (!client) {
    // prepare:false is required for Supabase's pooled (pgbouncer) connection.
    client = postgres(process.env.DATABASE_URL, { prepare: false });
  }
  return drizzle(client, { schema });
}
