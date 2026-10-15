import "server-only"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { db, schema } from "@/lib/db"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  user: {
    additionalFields: {
      plan: { type: "string", required: false, defaultValue: "free", input: false },
      dsaSkillLevel: { type: "string", required: false, defaultValue: "beginner", input: false },
      primaryResumeId: { type: "string", required: false, input: false },
    },
  },
  rateLimit: {
    enabled: true,
    // stored in Postgres so limits hold across serverless instances (memory storage resets per instance)
    storage: "database",
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 }, // slows password guessing
      "/sign-up/email": { window: 3600, max: 5 }, // limits throwaway accounts (each gets an AI quota)
    },
  },
  advanced: {
    // Vercel sets x-forwarded-for; used to key the auth rate limits by client IP
    ipAddress: { ipAddressHeaders: ["x-forwarded-for", "x-real-ip"] },
  },
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
