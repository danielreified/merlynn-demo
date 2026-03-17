"use client";

import React, { useState, useTransition } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@merlynn/ui";
import { submitFeedback } from "@/app/actions/decisions";
import type { Feedback } from "@merlynn/db";

interface FeedbackPanelProps {
  decisionId: string;
  existingFeedback?: Feedback;
}

export function FeedbackPanel({
  decisionId,
  existingFeedback,
}: FeedbackPanelProps): React.JSX.Element {
  const [rating, setRating] = useState<string | null>(existingFeedback?.rating ?? null);
  const [note, setNote] = useState(existingFeedback?.note ?? "");
  const [submitted, setSubmitted] = useState(!!existingFeedback);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!rating) return;
    startTransition(async () => {
      const result = await submitFeedback(
        decisionId,
        rating as "CORRECT" | "PARTIAL" | "INCORRECT",
        note || undefined
      );
      if (result.success) {
        setSubmitted(true);
      }
    });
  };

  const ratingOptions = [
    {
      value: "CORRECT",
      label: "Correct",
      icon: "✓",
      color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
    },
    {
      value: "PARTIAL",
      label: "Partially",
      icon: "~",
      color: "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
    },
    {
      value: "INCORRECT",
      label: "Incorrect",
      icon: "✗",
      color: "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Was TOM correct?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-3">
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => !submitted && setRating(option.value)}
                disabled={submitted}
                className={`flex-1 rounded-lg border px-4 py-3 text-center transition-all ${
                  rating === option.value
                    ? option.color + " ring-1 ring-current"
                    : submitted
                      ? "cursor-not-allowed border-slate-800 bg-slate-800/30 text-slate-600"
                      : "border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <span className="block text-lg">{option.icon}</span>
                <span className="mt-1 block text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>

          {!submitted && rating && (
            <>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note..."
                rows={2}
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleSubmit} disabled={isPending} size="sm">
                {isPending ? "Submitting..." : "Submit Feedback"}
              </Button>
            </>
          )}

          {submitted && (
            <p className="text-xs text-slate-500">
              Feedback recorded
              {existingFeedback?.submittedBy ? ` by ${existingFeedback.submittedBy}` : ""}.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
