import type { FeedbackInput } from "@/lib/feedback/schema"

// Example reviews for the demo database (seeded demo content, not real users).
export const DEMO_FEEDBACK: FeedbackInput[] = [
  {
    title: "The rewrite kept my facts",
    experience:
      "I was worried the AI would invent things. It didn't — it kept every employer and number from my PDF, but turned 'worked on dashboards' into a bullet with the actual impact. I changed two lines and sent it the same day.",
    feature: "Resume Builder",
    sentiment: "positive",
    name: "Sarah Johnson",
    role: "Software Engineer",
    company: "Tech Corp",
  },
  {
    title: "The mock interview asked about my real project",
    experience:
      "The interviewer brought up the latency work from my resume and kept pushing when my answer was vague. The debrief at the end told me I never quantified results, which was fair. Two weeks later I was asked almost the same question for real.",
    feature: "Mock Interview",
    sentiment: "positive",
    name: "Michael Chen",
    role: "Product Manager",
    company: "Innovation Labs",
  },
  {
    title: "Job match found the gap I missed",
    experience: "Pasted a posting and it flagged that I never mention GraphQL even though I've used it for a year. Small thing, but it was in the first line of the job description.",
    feature: "Job Match",
    sentiment: "positive",
    name: "Priya Nair",
    role: "Frontend Developer",
    company: "Northwind",
  },
  {
    title: "Good templates, wish there were more fonts",
    experience: "Polished and Minimal look professional and print cleanly. I'd like to change the accent colour per template though — right now it's all or nothing.",
    feature: "Templates",
    sentiment: "neutral",
    name: "Daniel Okafor",
    role: "Data Analyst",
    company: "Fabrikam",
  },
  {
    title: "Slow at peak times",
    experience: "Parsing my resume took almost a minute in the evening. It worked, and the result was good, but a progress estimate would help — I nearly refreshed the page.",
    feature: "Resume Builder",
    sentiment: "negative",
    name: "Lena Fischer",
    role: "UX Researcher",
    company: "Contoso",
  },
  {
    title: "STAR prompts are a great scaffold",
    experience: "Having the Situation / Task / Action / Result hints written for my own background made it much easier to prepare stories instead of staring at a blank page.",
    feature: "STAR Questions",
    sentiment: "positive",
    name: "Arjun Mehta",
    role: "Graduate Engineer",
    company: "VIT University",
  },
  {
    title: "DSA hints are well paced",
    experience: "The first hint nudges, the second points at the data structure, the third nearly gives it away. Getting bumped up a level after a clean solve was a nice touch.",
    feature: "DSA Practice",
    sentiment: "positive",
    name: "Alex Thompson",
    role: "Software Engineer",
    company: "Northwind",
  },
  {
    title: "Chat is helpful but long-winded",
    experience: "The coaching answers are solid and clearly use my resume, but they're often longer than they need to be. A 'shorter' toggle would be great.",
    feature: "Interview Chat",
    sentiment: "neutral",
    name: "Maria Rodriguez",
    role: "Product Manager",
    company: "Contoso",
  },
]
