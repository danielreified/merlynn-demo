import React from "react";
import type { Node } from "@xyflow/react";

interface FactorEditPanelProps {
  selectedNode: Node;
  onUpdate: (nodeId: string, data: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

export function FactorEditPanel({
  selectedNode,
  onUpdate,
  onDelete,
  onClose,
}: FactorEditPanelProps): React.JSX.Element {
  const nodeData = selectedNode.data as Record<string, unknown>;
  const nodeType = selectedNode.type;

  const handleChange = (field: string, value: string | number) => {
    onUpdate(selectedNode.id, { ...nodeData, [field]: value });
  };

  return (
    <div className="absolute right-0 top-0 z-10 flex h-full w-80 flex-col border-l border-slate-700 bg-slate-900 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
          Edit {nodeType}
        </h3>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Label - common to all */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Label</label>
          <input
            type="text"
            value={(nodeData.label as string) || ""}
            onChange={(e) => handleChange("label", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Factor-specific fields */}
        {nodeType === "factor" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Description</label>
              <textarea
                value={(nodeData.description as string) || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Weight (0-100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={(nodeData.weight as number) ?? ""}
                onChange={(e) =>
                  handleChange(
                    "weight",
                    e.target.value === "" ? ("" as unknown as number) : Number(e.target.value)
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Decision-specific fields */}
        {nodeType === "decision" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Threshold</label>
            <input
              type="number"
              value={(nodeData.threshold as number) ?? ""}
              onChange={(e) =>
                handleChange(
                  "threshold",
                  e.target.value === "" ? ("" as unknown as number) : Number(e.target.value)
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Output-specific fields */}
        {nodeType === "output" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Risk Level</label>
            <select
              value={(nodeData.riskLevel as string) || "MEDIUM"}
              onChange={(e) => handleChange("riskLevel", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        )}
      </div>

      {/* Delete button */}
      <div className="border-t border-slate-700 p-4">
        <button
          onClick={() => onDelete(selectedNode.id)}
          className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
        >
          Delete Node
        </button>
      </div>
    </div>
  );
}
