import React from "react";
import { cn } from "@merlynn/ui";

const models = [
  { name: "Fraud Analyst — Carl", status: "deployed", dotColor: "bg-emerald-400" },
  { name: "Cognitive Impairment", status: "training", dotColor: "bg-amber-400" },
  { name: "Cyber Risk", status: "draft", dotColor: "bg-slate-500" },
];

export function ActiveModels(): React.JSX.Element {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="mb-4 text-lg font-semibold text-white">Active Models</h2>
      <div className="space-y-3">
        {models.map((model) => (
          <div
            key={model.name}
            className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-800/30 px-4 py-3"
          >
            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", model.dotColor)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-200">{model.name}</p>
              <p className="text-[11px] capitalize text-slate-500">{model.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
