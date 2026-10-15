import type { Metadata } from "next"
import { DsaPractice } from "@/components/interview/dsa-practice"
import { getDsaState } from "@/lib/actions/dsa"

export const metadata: Metadata = { title: "DSA practice" }
export const maxDuration = 120

export default async function DsaPage() {
  const { skillLevel, challenges } = await getDsaState()
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <DsaPractice skillLevel={skillLevel} challenges={challenges} />
    </div>
  )
}
