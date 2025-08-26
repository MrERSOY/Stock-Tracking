import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env-validation";

// Build time'da DATABASE_URL yoksa placeholder kullan
const databaseUrl =
  env.DATABASE_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export const db = drizzle(databaseUrl);
