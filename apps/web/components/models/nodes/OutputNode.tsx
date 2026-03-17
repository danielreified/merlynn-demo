import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

const riskColors: Record<string, { border: string; text: string; bg: string }> = {
  HIGH: { border: "border-l-red-500", text: "text-red-400", bg: "bg-red-500/20" },
  MEDIUM: { border: "border-l-amber-500", text: "text-amber-400", bg: "bg-amber-500/20" },
  LOW: { border: "border-l-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/20" },
};

export function OutputNode({ data }: NodeProps): React.JSX.Element {
  const riskLevel = ((data as Record<string, unknown>).riskLevel as string) || "MEDIUM";
  const colors = riskColors[riskLevel] || riskColors.MEDIUM;

  return (
    <div
      className={`min-w-[160px] rounded-lg border border-l-4 border-slate-700 ${colors.border} bg-slate-800 px-4 py-3 shadow-lg`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-slate-700 !bg-slate-400"
      />
      <div className={`text-xs font-semibold uppercase tracking-wider ${colors.text} mb-1`}>
        Output
      </div>
      <div className="text-sm font-medium text-slate-200">
        {(data as Record<string, unknown>).label as string}
      </div>
      {riskLevel && (
        <div className="mt-2">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${colors.bg} ${colors.text}`}
          >
            {riskLevel}
          </span>
        </div>
      )}
    </div>
  );
}
