import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

export function DecisionNode({ data }: NodeProps): React.JSX.Element {
  return (
    <div className="min-w-[160px] rounded-lg border border-l-4 border-slate-700 border-l-amber-500 bg-slate-800 px-4 py-3 shadow-lg">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-slate-700 !bg-amber-500"
      />
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
        Decision
      </div>
      <div className="text-sm font-medium text-slate-200">
        {(data as Record<string, unknown>).label as string}
      </div>
      {(data as Record<string, unknown>).threshold != null && (
        <div className="mt-1 text-xs text-slate-400">
          Threshold: {String((data as Record<string, unknown>).threshold)}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-slate-700 !bg-amber-500"
      />
    </div>
  );
}
