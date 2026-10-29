import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bot, Send, User } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Student Portal" },
      {
        name: "description",
        content: "Ask the grievance assistant about policies, status updates and next steps.",
      },
      { property: "og:title", content: "AI Assistant — Student Portal" },
      {
        property: "og:description",
        content: "Ask the grievance assistant about policies, status updates and next steps.",
      },
    ],
  }),
  component: Assistant,
});

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
}

const SUGGESTIONS = [
  "How do I submit a grievance?",
  "What category does my complaint belong to?",
  "How can I track my grievance?",
  "What happens after I submit a grievance?",
];

const CANNED =
  "Thanks for your question. Once the AI services are connected, I will answer using the university grievance policy knowledge base. For now, here is the general guidance: most grievances receive a first response within 3 working days and are resolved within 15 working days, after which they are automatically escalated.";

const RULES: [string[], string][] = [
  [
    ["submit", "file", "raise"],
    "Open “Submit Grievance” from the sidebar, fill in the title, category and description, attach any supporting document, then press Submit. You will get a reference ID straight away.",
  ],
  [
    ["track", "status", "where"],
    "Go to “Track Grievance” and enter your reference ID (for example GRV-2026-0142). You will see the current stage, the assigned department and the full timeline.",
  ],
  [
    ["category", "which department", "belong"],
    "Pick the category that matches your issue: Academic, Examination, Fees, Scholarship, Hostel, Library, Transport, Infrastructure, IT/Technical or Other. The system also recommends the right department automatically.",
  ],
  [
    ["after", "happens", "next", "process"],
    "After submission your case is analysed, routed to a department, reviewed, worked on, and a resolution is proposed. You are notified at every stage and can rate the resolution at the end.",
  ],
];

function reply(question: string) {
  const q = question.toLowerCase();
  return RULES.find(([keys]) => keys.some((k) => q.includes(k)))?.[1] ?? CANNED;
}

function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: "bot",
      text: "Hello! I am your grievance assistant. Ask me about policies, timelines or the status of a case.",
    },
  ]);
  const [input, setInput] = useState("");

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, from: "user", text: value },
      { id: prev.length + 2, from: "bot", text: reply(value) },
    ]);
    setInput("");
  }

  return (
    <>
      <PageHeader
        title="AI Grievance Assistant"
        description="Ask about submitting, tracking or categorising a grievance."
        crumbs={[{ label: "Student Portal", to: "/student" }, { label: "AI Assistant" }]}
        actions={
          <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-foreground">
            AI Assistant — Demo Mode
          </span>
        }
      />

      <div className="surface-card flex h-[min(70vh,620px)] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex gap-3", m.from === "user" && "flex-row-reverse text-right")}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg",
                  m.from === "bot" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground",
                )}
              >
                {m.from === "bot" ? <Bot className="size-4" /> : <User className="size-4" />}
              </span>
              <p
                className={cn(
                  "max-w-[75%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                  m.from === "bot" ? "bg-secondary" : "bg-primary text-primary-foreground",
                )}
              >
                {m.text}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
            />
            <Button type="submit" size="icon" aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
