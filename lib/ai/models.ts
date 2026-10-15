import "server-only"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

// Free OpenRouter models, picked per task. Each slot is primary + fallbacks; OpenRouter tries them
// in order when one is down or rate-limited. Override any slot with a comma-separated env var,
// e.g. AI_MODELS_STRUCTURED="google/gemma-4-31b-it:free,nvidia/nemotron-3-super-120b-a12b:free".
const DEFAULT_SLOTS = {
  // strict JSON: resume parsing, job matching, STAR sets, DSA generation (fastest accurate extractor)
  structured: [
    "nvidia/nemotron-3-super-120b-a12b:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "google/gemma-4-31b-it:free",
  ],
  // long-form conversation: chat, mock interviews, resume reviews (strongest writer)
  chat: [
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "google/gemma-4-31b-it:free",
  ],
  // grading code
  code: [
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "cohere/north-mini-code:free",
  ],
} as const

export type ModelSlot = keyof typeof DEFAULT_SLOTS

function slotModels(slot: ModelSlot): string[] {
  const override = process.env[`AI_MODELS_${slot.toUpperCase()}`]
  const list = override
    ? override.split(",").map((m) => m.trim()).filter(Boolean)
    : [...DEFAULT_SLOTS[slot]]
  return list
}

let provider: ReturnType<typeof createOpenRouter> | undefined
function getProvider() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set")
  provider ??= createOpenRouter({
    apiKey,
    appName: "Folio",
    appUrl: process.env.BETTER_AUTH_URL,
  })
  return provider
}

export function model(slot: ModelSlot) {
  const [primary, ...fallbacks] = slotModels(slot)
  return getProvider()(primary, {
    models: fallbacks.length ? fallbacks : undefined,
    // these are reasoning models: keep thinking short and out of the visible answer
    reasoning: { effort: "low", exclude: true },
    // repair slightly malformed JSON from small models (non-streaming only)
    plugins: slot === "structured" || slot === "code" ? [{ id: "response-healing" }] : undefined,
  })
}
