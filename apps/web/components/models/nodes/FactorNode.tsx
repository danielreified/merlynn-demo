import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

export function FactorNode({ data }: NodeProps): React.JSX.Element {
  return (
    <div className="min-w-[160px] rounded-lg border border-l-4 border-slate-700 border-l-blue-500 bg-slate-800 px-4 py-3 shadow-lg">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
        Factor
      </div>
      <div className="text-sm font-medium text-slate-200">
        {(data as Record<string, unknown>).label as string}
      </div>
      {(data as Record<string, unknown>).weight != null && (
        <div className="mt-1 text-xs text-slate-400">
          Weight: {String((data as Record<string, unknown>).weight)}%
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-slate-700 !bg-blue-500"
      />
    </div>
  );
}
