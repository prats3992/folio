"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Do I need a credit card?",
    answer:
      "No. Folio is a student project and there is no billing — paid tiers are a demo. You can switch plans for free from your dashboard to see how the limits change.",
  },
  {
    question: "What does a plan actually change?",
    answer:
      "Only your daily AI request limit (30, 100 or 300 per day). Every feature — all templates, PDF export, sharing and every interview tool — is available on every plan.",
  },
  {
    question: "Which AI models do you use?",
    answer:
      "Free open models served through OpenRouter (NVIDIA Nemotron and Google Gemma), picked per task with automatic fallbacks. Responses can take up to a minute during busy periods.",
  },
  {
    question: "What happens to my resume data?",
    answer:
      "Your resume text is extracted on our server and sent only to the AI model for parsing. It's stored in your account, private by default, and only becomes public if you turn on a share link.",
  },
]

export function FAQ() {
  return (
    <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
      <div>
        <p className="eyebrow mb-3">Questions</p>
        <h2 className="display text-4xl">The fine print, in plain words.</h2>
      </div>
      <Accordion type="single" collapsible className="w-full border-t">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="py-5 text-left text-base">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
