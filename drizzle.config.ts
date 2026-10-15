import { defineConfig } from "drizzle-kit"

try {
  process.loadEnvFile(".env.local")
} catch {
  // fall back to the ambient environment (CI / Vercel)
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
})
