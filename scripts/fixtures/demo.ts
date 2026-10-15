import type { BehavioralQuestion, DsaChallengePublic, JobAnalysisResult } from "@/lib/ai/schemas"
import type { ResumeDataInput } from "@/lib/resume/schema"

// Hand-written demo content for the public demo account (fictional person, no AI calls needed).

const base: ResumeDataInput = {
  personalInfo: {
    name: "Alex Rivera",
    role: "Full-Stack Engineer",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 010-2040",
    location: "Austin, TX",
    github: "github.com/alexrivera-demo",
    linkedin: "linkedin.com/in/alexrivera-demo",
    website: "alexrivera.dev",
    summary:
      "Full-stack engineer with 4 years of experience shipping React and Node.js products used by 50k+ people. Enjoys turning slow, fragile systems into fast, well-tested ones and mentoring newer engineers.",
  },
  experience: [
    {
      role: "Software Engineer II",
      company: "Brightpath Health",
      location: "Austin, TX",
      date: "2023 – Present",
      achievements: [
        "Led the rebuild of the patient-booking flow in Next.js and TypeScript, lifting completed bookings by 18%",
        "Cut p95 API latency from 900 ms to 220 ms by adding Redis caching and fixing N+1 queries in PostgreSQL",
        "Introduced Playwright end-to-end tests in CI, reducing production regressions by 35% over two quarters",
        "Mentored 3 junior engineers through weekly pairing and code review",
      ],
    },
    {
      role: "Software Engineer",
      company: "Loop Logistics",
      location: "Remote",
      date: "2021 – 2023",
      achievements: [
        "Built a real-time shipment tracking dashboard (React, WebSockets) used by 400+ dispatchers",
        "Designed a Node.js event pipeline on AWS SQS processing 2M events/day with zero data loss",
        "Automated weekly reporting with Python, saving the ops team ~10 hours per week",
      ],
    },
  ],
  projects: [
    {
      name: "Splitwise Lite",
      description: "Expense-splitting PWA with offline support and optimistic sync; 1.2k monthly users.",
      technologies: ["Next.js", "Drizzle", "PostgreSQL", "Service Workers"],
      url: "github.com/alexrivera-demo/splitwise-lite",
    },
    {
      name: "Paper Trail",
      description: "CLI that turns git history into release notes using conventional commits.",
      technologies: ["TypeScript", "Node.js", "GitHub Actions"],
      url: "",
    },
  ],
  education: [
    { degree: "B.S. Computer Science", school: "University of Texas at Austin", location: "Austin, TX", date: "2017 – 2021" },
  ],
  skills: {
    technical: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Redis", "AWS", "Docker", "Playwright", "Python"],
    soft: ["Mentoring", "Cross-team communication", "Ownership", "Technical writing"],
  },
  certifications: [{ name: "AWS Certified Developer – Associate", issuer: "Amazon Web Services", date: "2024" }],
}

export const DEMO_RESUMES: { title: string; targetRole: string; template: string; isPublic: boolean; shareSlug: string | null; data: ResumeDataInput }[] = [
  {
    title: "Alex Rivera — Frontend Engineer",
    targetRole: "Senior Frontend Engineer",
    template: "polished",
    isPublic: true,
    shareSlug: "alex-rivera-demo",
    data: {
      ...base,
      personalInfo: {
        ...base.personalInfo,
        role: "Senior Frontend Engineer",
        summary:
          "Frontend-focused engineer with 4 years building fast, accessible React and Next.js apps. Shipped booking and dashboard experiences used by 50k+ people and cares deeply about performance budgets and testing.",
      },
    },
  },
  {
    title: "Alex Rivera — Full-Stack",
    targetRole: "Full-Stack Engineer",
    template: "timeline",
    isPublic: false,
    shareSlug: null,
    data: base,
  },
]

type Msg = { role: "user" | "assistant"; text: string }

export const DEMO_CHATS: { title: string; kind: "general" | "resume_review" | "mock_interview"; resumeIndex: number; targetRole: string; messages: Msg[] }[] = [
  {
    title: "Answering “Tell me about yourself”",
    kind: "general",
    resumeIndex: 0,
    targetRole: "Senior Frontend Engineer",
    messages: [
      { role: "user", text: "How should I answer “Tell me about yourself” for a senior frontend role?" },
      {
        role: "assistant",
        text: `Use a **present → past → future** structure and keep it to about 90 seconds:

1. **Present** — "I'm a software engineer at Brightpath Health, where I lead the frontend of our patient-booking product."
2. **Past** — pick two proof points from your resume:
   - the Next.js rebuild that lifted completed bookings by **18%**
   - introducing Playwright tests that cut regressions by **35%**
3. **Future** — tie it to the role: "I'm looking for a senior role where I can own frontend architecture and mentor a team, which is why this position stood out."

**Tip:** end with a hook the interviewer can follow up on, like performance work or mentoring.`,
      },
      { role: "user", text: "What if they ask why I'm leaving Brightpath?" },
      {
        role: "assistant",
        text: "Keep it positive and forward-looking: *\"I've learned a lot leading the booking rebuild, and I'm now looking for a larger frontend surface and a team where I can grow into a tech-lead role.\"* Avoid criticising your current employer, and connect your answer back to what this company offers.",
      },
    ],
  },
  {
    title: "Resume review — Senior Frontend Engineer",
    kind: "resume_review",
    resumeIndex: 0,
    targetRole: "Senior Frontend Engineer",
    messages: [
      { role: "user", text: "Please review my resume \"Alex Rivera — Frontend Engineer\" for a Senior Frontend Engineer role." },
      {
        role: "assistant",
        text: `**Overall impression — 82/100**
A strong, metric-driven resume. It reads as mid-to-senior; a few tweaks will make the senior signal unmistakable.

**Strengths**
- Every recent bullet is quantified (18% bookings, 900→220 ms, 35% fewer regressions).
- Modern, relevant stack: Next.js, TypeScript, Playwright.

**Weaknesses**
- Little evidence of *frontend architecture* decisions (state management, design systems).
- Accessibility is mentioned in the summary but never demonstrated.

**Skills gap for the role**
- Design systems / component libraries, Web Vitals tooling, accessibility auditing (axe, WCAG 2.2).

**Specific rewrite suggestions**
> "Led the rebuild of the patient-booking flow in Next.js and TypeScript…"

→ "Led the architecture and rebuild of the patient-booking flow (Next.js, TypeScript, server components), lifting completed bookings by 18% and improving LCP from 3.1 s to 1.4 s."

**ATS tips**
- Add "React" explicitly in your experience bullets, not only in Skills.
- Mirror the job post's wording for "design system" if you have that experience.`,
      },
    ],
  },
  {
    title: "Mock interview — Senior Frontend Engineer",
    kind: "mock_interview",
    resumeIndex: 0,
    targetRole: "Senior Frontend Engineer",
    messages: [
      { role: "user", text: "Hi! I'm ready to start the interview." },
      {
        role: "assistant",
        text: "Welcome, Alex — thanks for joining. Let's start with your recent work.\n\n**Question 1:** You cut p95 latency from 900 ms to 220 ms at Brightpath. Walk me through how you found the bottleneck and how you decided what to fix first.",
      },
      {
        role: "user",
        text: "We had tracing in Datadog, so I sorted endpoints by p95 and found the booking-search endpoint was doing an N+1 query per clinic. I rewrote it as a single join, then added Redis caching for clinic availability with a 60 second TTL since it changes rarely.",
      },
      {
        role: "assistant",
        text: "Good — data-driven and you fixed the root cause before caching. I'd have liked to hear how you handled cache invalidation when a slot gets booked.\n\n**Question 2:** Tell me about a time you disagreed with a product or design decision. What did you do?",
      },
      {
        role: "user",
        text: "Design wanted a multi-step modal for booking. I built a quick prototype of a single-page flow, we A/B tested both and the single page converted better, so we shipped that.",
      },
      {
        role: "assistant",
        text: "Nice use of evidence over opinion. Next time, quantify the result and mention how you kept the relationship with design positive.\n\n**Question 3:** How would you structure state management for a large booking app with many forms?",
      },
      { role: "user", text: "end" },
      {
        role: "assistant",
        text: `## Interview debrief

**Overall score: 7.5 / 10**

**Strengths**
- Clear, structured answers grounded in real metrics.
- You fix root causes before reaching for caching.
- You resolve disagreements with prototypes and data.

**Areas to improve**
- Close the loop on edge cases (cache invalidation) without being prompted.
- Quantify outcomes in behavioural answers.
- Practise architecture questions — you ended before question 3.

**Next steps**
1. Prepare a 2-minute answer on frontend state management (server state vs. client state, forms).
2. Rehearse 3 STAR stories with explicit numbers.
3. Review cache invalidation strategies (write-through, event-based busting).`,
      },
    ],
  },
]

export const DEMO_JOB_ANALYSIS: { jobTitle: string; jobDescription: string; resumeIndex: number; result: JobAnalysisResult } = {
  jobTitle: "Senior Frontend Engineer at Northstar",
  resumeIndex: 0,
  jobDescription: `Northstar is hiring a Senior Frontend Engineer to lead our customer dashboard.
You will: own frontend architecture in React and TypeScript; build and maintain our design system; improve Core Web Vitals; mentor engineers; partner with design and product.
Requirements: 5+ years frontend experience; deep React/TypeScript; experience with design systems (Storybook); testing (Jest, Playwright); accessibility (WCAG); GraphQL a plus.`,
  result: {
    overallMatch: 74,
    summary:
      "Strong overlap on React, TypeScript, testing and mentoring. The main gaps are design-system ownership, explicit accessibility work and GraphQL.",
    matchingSkills: ["React", "TypeScript", "Next.js", "Playwright", "Mentoring", "Performance optimisation"],
    missingSkills: ["Storybook / design systems", "WCAG accessibility", "GraphQL", "Jest"],
    matchingExperience: [
      "Led a Next.js rebuild that increased conversions by 18%",
      "Introduced end-to-end testing in CI",
      "Mentored three junior engineers",
    ],
    missingExperience: ["Owning a shared component library", "5+ years of frontend experience (resume shows ~4)"],
    suggestedChanges: [
      "Add any component-library or shared UI work you did at Brightpath, even if informal",
      "Mention accessibility fixes or audits explicitly with WCAG terminology",
      "Add Core Web Vitals numbers (LCP/INP) to the booking rebuild bullet",
      "List Jest alongside Playwright if you've used it",
    ],
  },
}

export const DEMO_STAR_SET: { jobTitle: string; resumeIndex: number; questions: BehavioralQuestion[] } = {
  jobTitle: "Senior Frontend Engineer",
  resumeIndex: 0,
  questions: [
    {
      question: "Tell me about a time you improved the performance of a product in a measurable way.",
      category: "success",
      starPrompt: {
        situation: "Describe the slow booking-search endpoint and how it affected users.",
        task: "Explain that you owned bringing p95 latency down.",
        action: "Walk through tracing, fixing the N+1 query and adding Redis caching.",
        result: "Share the 900 ms → 220 ms improvement and any business impact.",
      },
    },
    {
      question: "Describe a disagreement with a designer or product manager and how you resolved it.",
      category: "conflict",
      starPrompt: {
        situation: "Set up the multi-step modal vs. single-page booking debate.",
        task: "Your goal was to ship the flow that converted best, not to win the argument.",
        action: "Explain the prototype and A/B test you proposed and how you kept it collaborative.",
        result: "Quantify the conversion difference and what the team learned.",
      },
    },
    {
      question: "Give an example of mentoring someone who was struggling.",
      category: "leadership",
      starPrompt: {
        situation: "Introduce the junior engineer and the challenge they faced.",
        task: "Clarify your role as their mentor.",
        action: "Describe the pairing sessions, code review approach and goals you set.",
        result: "Describe their growth — e.g. shipping a feature independently.",
      },
    },
    {
      question: "Tell me about a time a production issue happened on your watch.",
      category: "failure",
      starPrompt: {
        situation: "Describe the incident and its user impact.",
        task: "Explain your responsibility during and after the incident.",
        action: "Cover mitigation, root-cause analysis and the tests you added.",
        result: "Share how regressions dropped after adding Playwright to CI.",
      },
    },
    {
      question: "Describe a time you took initiative beyond your assigned work.",
      category: "initiative",
      starPrompt: {
        situation: "The ops team spent hours on manual weekly reports.",
        task: "You saw an opportunity to automate it, unprompted.",
        action: "Explain the Python automation you built and how you got buy-in.",
        result: "About 10 hours saved per week for the ops team.",
      },
    },
  ],
}

export const DEMO_DSA: {
  skillLevel: string
  challenge: DsaChallengePublic
  solution: string
  explanation: string
  submission: { userSolution: string; success: boolean; score: number; feedback: string; timeSpentSec: number; hintsUsed: number } | null
}[] = [
  {
    skillLevel: "beginner",
    challenge: {
      title: "First Unique Character",
      description:
        "Given a string `s`, return the index of the first character that appears **exactly once**. If no such character exists, return `-1`.",
      constraints: ["1 ≤ s.length ≤ 10^5", "s consists of lowercase English letters"],
      sampleInput: 's = "loveleetcode"',
      sampleOutput: "2",
      hints: [
        "You need to know how many times each character occurs before deciding.",
        "A hash map (or a 26-length array) can store the counts in one pass.",
        "Make a second pass over the string and return the first index whose count is 1.",
      ],
      difficulty: "Easy",
      category: "Strings",
    },
    solution: `def first_unique(s):
    counts = [0] * 26
    for ch in s:
        counts[ord(ch) - 97] += 1
    for i, ch in enumerate(s):
        if counts[ord(ch) - 97] == 1:
            return i
    return -1`,
    explanation: "Count every character in one pass, then scan again for the first character with count 1. **O(n)** time, **O(1)** extra space (26 counters).",
    submission: {
      userSolution: `from collections import Counter

def first_unique(s):
    c = Counter(s)
    for i, ch in enumerate(s):
        if c[ch] == 1:
            return i
    return -1`,
      success: true,
      score: 9,
      feedback:
        "**Correct.** Two passes with a `Counter` is the optimal O(n) approach.\n\n- Time: O(n), space: O(1) since the alphabet is fixed.\n- Handles the no-unique case by returning -1.\n\n*Nit:* a fixed 26-length array avoids hashing overhead, but `Counter` is perfectly fine in an interview.",
      timeSpentSec: 412,
      hintsUsed: 0,
    },
  },
  {
    skillLevel: "intermediate",
    challenge: {
      title: "Meeting Rooms Needed",
      description:
        "You are given a list of meetings, each a half-open interval [start, end). Return the **minimum number of rooms** required so that no two overlapping meetings share a room.",
      constraints: ["1 ≤ meetings.length ≤ 10^4", "0 ≤ start < end ≤ 10^6"],
      sampleInput: "meetings = [[0,30],[5,10],[15,20]]",
      sampleOutput: "2",
      hints: [
        "Think about what happens at each moment a meeting starts or ends.",
        "Sorting the start times and end times separately lets you sweep through time.",
        "A min-heap of end times tells you whether the earliest-ending room is free.",
      ],
      difficulty: "Medium",
      category: "Two Pointers",
    },
    solution: `def min_rooms(meetings):
    starts = sorted(m[0] for m in meetings)
    ends = sorted(m[1] for m in meetings)
    rooms = best = j = 0
    for s in starts:
        while ends[j] <= s:
            rooms -= 1; j += 1
        rooms += 1
        best = max(best, rooms)
    return best`,
    explanation: "Sweep line over sorted start and end times: each start needs a room, each end frees one. **O(n log n)** time for sorting, **O(n)** space.",
    submission: null,
  },
]
