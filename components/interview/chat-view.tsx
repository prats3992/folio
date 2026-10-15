"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { ArrowUp, RotateCcw, Square } from "lucide-react"
import { Markdown } from "@/components/markdown"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const MOCK_KICKOFF = "Hi! I'm ready to start the interview."

const SUGGESTIONS: Record<string, string[]> = {
  general: [
    "What are the weakest parts of my resume for my target role?",
    "How should I answer “Tell me about yourself”?",
    "Give me a 2-week interview prep plan.",
    "What questions should I ask the interviewer?",
  ],
  resume_review: ["Rewrite my top three bullet points.", "Which skills should I learn next for this role?"],
  mock_interview: [],
}

function errorText(error: Error) {
  try {
    const parsed = JSON.parse(error.message) as { error?: string }
    if (parsed.error) return parsed.error
  } catch {
    // not JSON
  }
  return error.message || "Something went wrong."
}

const textOf = (m: UIMessage) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")

export function ChatView({
  chatId,
  kind,
  title,
  resumeTitle,
  initialMessages,
}: {
  chatId: string
  kind: string
  title: string
  resumeTitle: string | null
  initialMessages: UIMessage[]
}) {
  const router = useRouter()
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const kickedOff = useRef(false)

  const { messages, sendMessage, status, error, stop, regenerate, clearError } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      // the server owns history; only send the new message
      prepareSendMessagesRequest: ({ messages, id }) => ({ body: { id, message: messages[messages.length - 1] } }),
    }),
    onFinish: () => router.refresh(), // refresh sidebar title / ordering
  })

  const busy = status === "submitted" || status === "streaming"

  // mock interviews start themselves so the interviewer asks the first question
  useEffect(() => {
    if (kind !== "mock_interview" || initialMessages.length > 0 || kickedOff.current) return
    // deferred + cancellable so React StrictMode's mount/unmount/mount sends exactly once
    const t = setTimeout(() => {
      kickedOff.current = true
      void sendMessage({ text: MOCK_KICKOFF })
    }, 0)
    return () => clearTimeout(t)
  }, [kind, initialMessages.length, sendMessage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, status])

  function submit(text: string) {
    const value = text.trim()
    if (!value || busy) return
    clearError()
    void sendMessage({ text: value })
    setInput("")
  }

  const suggestions = messages.length === 0 ? (SUGGESTIONS[kind] ?? []) : []

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline gap-4 border-b px-6 py-4">
        <div className="min-w-0">
          <p className="eyebrow">{kind === "mock_interview" ? "Mock interview" : kind === "resume_review" ? "Resume review" : "Coaching"}</p>
          <h1 className="display truncate text-2xl">{title}</h1>
        </div>
        {resumeTitle && <span className="eyebrow ml-auto hidden truncate sm:block">Resume · {resumeTitle}</span>}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">
          {messages.length === 0 && kind !== "mock_interview" && (
            <div className="py-10">
              <h2 className="display text-4xl">How can I help you prepare?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {resumeTitle ? "I've read your resume, so feel free to ask about it." : "Ask me anything about interviews or resumes."}
              </p>
              <ul className="mt-8 divide-y border-y">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button className="w-full py-3 text-left text-sm hover:text-primary" onClick={() => submit(s)}>
                      {s} <span className="text-muted-foreground">→</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.role === "user"
            const speaker = isUser ? "You" : kind === "mock_interview" ? "Interviewer" : "Coach"
            return (
              <div key={m.id} className={cn(isUser && "border-l-2 pl-4")}>
                <p className={cn("eyebrow mb-1.5", !isUser && "text-primary")}>{speaker}</p>
                {isUser ? (
                  <p className="text-[0.95rem] whitespace-pre-wrap text-muted-foreground">{textOf(m)}</p>
                ) : (
                  <Markdown className="prose-base">{textOf(m)}</Markdown>
                )}
              </div>
            )
          })}

          {status === "submitted" && (
            <div className="eyebrow flex items-center gap-2">
              <Spinner /> Thinking — free models can take up to a minute
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                {errorText(error)}
                <Button size="sm" variant="outline" onClick={() => regenerate()}>
                  <RotateCcw /> Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t bg-background px-6 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit(input)
          }}
          className="mx-auto flex max-w-3xl items-end gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                submit(input)
              }
            }}
            placeholder={kind === "mock_interview" ? "Your answer… (type “end” for your debrief)" : "Ask anything…"}
            maxLength={4000}
            rows={1}
            className="max-h-48 min-h-11 resize-none bg-card"
            aria-label="Message"
            name="message"
          />
          {busy ? (
            <Button type="button" size="icon-lg" variant="outline" onClick={() => stop()} aria-label="Stop">
              <Square />
            </Button>
          ) : (
            <Button type="submit" size="icon-lg" disabled={!input.trim()} aria-label="Send">
              <ArrowUp />
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}
