"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@merlynn/ui";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface AskTomPanelProps {
  decisionContext: {
    transactionId: string;
    riskLevel: string;
    riskScore: number;
    supplierName: string;
    explanation: string;
  };
}

const SUGGESTED_QUESTIONS = [
  "Why was this flagged?",
  "What would change this decision?",
  "How confident is the model?",
];

const MOCK_RESPONSES: Record<string, string> = {
  "Why was this flagged?":
    "This transaction was flagged due to a combination of high-risk jurisdiction exposure and unusual transaction patterns. The primary risk factors include elevated amounts relative to historical baselines and counterparty risk indicators.",
  "What would change this decision?":
    "The risk assessment would improve if the supplier had a longer verified trading history, the transaction amount was within typical ranges, and the jurisdiction risk was lower. Additional documentation such as verified invoices or third-party due diligence reports could also reduce the score.",
  "How confident is the model?":
    "The model is highly confident in this assessment. The risk factors align closely with known patterns in the training data, and multiple independent signals converge on the same conclusion.",
};

export function AskTomPanel({ decisionContext }: AskTomPanelProps): React.JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `I analyzed transaction ${decisionContext.transactionId} for ${decisionContext.supplierName}. The risk level is ${decisionContext.riskLevel} with a score of ${decisionContext.riskScore}/100. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const message = text || input.trim();
    if (!message || isTyping) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setIsTyping(true);

    setTimeout(
      () => {
        const response =
          MOCK_RESPONSES[message] ||
          `Based on my analysis of this ${decisionContext.riskLevel.toLowerCase()}-risk transaction, ${decisionContext.explanation.slice(0, 150)}... I'd recommend reviewing the SHAP factor breakdown for more details on individual risk contributions.`;

        setMessages((prev) => [...prev, { role: "assistant", content: response }]);
        setIsTyping(false);
      },
      800 + Math.random() * 600
    );
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20">
            <svg
              className="h-4 w-4 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <CardTitle className="!text-sm !font-semibold !text-slate-200">Ask TOM</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col pt-0">
        <div
          ref={scrollRef}
          className="mb-3 max-h-[400px] min-h-[200px] flex-1 space-y-3 overflow-y-auto"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.role === "assistant"
                  ? "bg-slate-800/50 text-slate-300"
                  : "ml-6 bg-blue-600/15 text-blue-200"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {isTyping && (
            <div className="rounded-lg bg-slate-800/50 px-3 py-2 text-sm text-slate-500">
              TOM is thinking...
            </div>
          )}
        </div>

        {messages.length === 1 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="rounded-md border border-slate-700 bg-slate-800/50 px-2.5 py-1.5 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about this decision..."
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button size="sm" onClick={() => handleSend()} disabled={!input.trim() || isTyping}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
