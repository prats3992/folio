import "server-only"
import { neon } from "@neondatabase/serverless"
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http"
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

function createDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  // Neon in production (HTTP driver, ideal for serverless); any other Postgres URL (e.g. local Docker)
  // uses postgres-js. Both expose the same Drizzle query API used throughout the app.
  if (new URL(url).hostname.endsWith(".neon.tech")) {
    return drizzleNeon({ client: neon(url), schema, casing: "snake_case" })
  }
  return drizzlePostgres({ client: postgres(url, { max: 5 }), schema, casing: "snake_case" }) as unknown as ReturnType<
    typeof drizzleNeon<typeof schema>
  >
}

type Db = ReturnType<typeof createDb>

// Lazily created so `next build` works without a database configured.
let instance: Db | undefined
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    instance ??= createDb()
    return Reflect.get(instance, prop, receiver)
  },
})

export { schema }
