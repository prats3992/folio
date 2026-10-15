// Single source of truth for plans. There is no billing: plans only change the daily AI quota
// and are switched from the dashboard (demo).

export type PlanId = "free" | "basic" | "premium"

export interface Plan {
  id: PlanId
  name: string
  price: number
  tagline: string
  dailyAiLimit: number
  features: string[]
  highlighted?: boolean
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    tagline: "Everything you need to get started",
    dailyAiLimit: 30,
    features: [
      "AI resume parsing & 10 templates",
      "PDF export & public share link",
      "All interview tools (chat, mock, STAR, DSA, job match)",
      "30 AI requests per day",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: 9,
    tagline: "For an active job search",
    dailyAiLimit: 100,
    highlighted: true,
    features: [
      "Everything in Free",
      "100 AI requests per day",
      "Room for daily job-description matching",
      "Practice STAR sets for every application",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 19,
    tagline: "Interview season, full throttle",
    dailyAiLimit: 300,
    features: [
      "Everything in Basic",
      "300 AI requests per day",
      "Long mock-interview sessions",
      "Daily adaptive DSA practice",
    ],
  },
]

export const getPlan = (id: string | null | undefined): Plan =>
  PLANS.find((p) => p.id === id) ?? PLANS[0]
