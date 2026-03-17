"use client";

import React, { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Node, Edge } from "@xyflow/react";
import { ModelCanvas } from "@/components/models/ModelCanvas";
import { createModel } from "@/app/actions/models";

const defaultNodes: Node[] = [
  {
    id: "factor-1",
    type: "factor",
    position: { x: 100, y: 50 },
    data: { label: "Transaction Amount", weight: 60 },
  },
  {
    id: "factor-2",
    type: "factor",
    position: { x: 400, y: 50 },
    data: { label: "Country Risk Score", weight: 40 },
  },
  {
    id: "decision-1",
    type: "decision",
    position: { x: 250, y: 250 },
    data: { label: "Risk Evaluation", threshold: 70 },
  },
  {
    id: "output-1",
    type: "output",
    position: { x: 250, y: 450 },
    data: { label: "Risk Classification", riskLevel: "MEDIUM" },
  },
];

const defaultEdges: Edge[] = [
  {
    id: "e-f1-d1",
    source: "factor-1",
    target: "decision-1",
    style: { stroke: "#475569", strokeWidth: 2 },
    type: "smoothstep",
  },
  {
    id: "e-f2-d1",
    source: "factor-2",
    target: "decision-1",
    style: { stroke: "#475569", strokeWidth: 2 },
    type: "smoothstep",
  },
  {
    id: "e-d1-o1",
    source: "decision-1",
    target: "output-1",
    style: { stroke: "#475569", strokeWidth: 2 },
    type: "smoothstep",
  },
];

export default function NewModelPage(): React.JSX.Element {
  const router = useRouter();
  const [name, setName] = useState("Untitled Model");
  const [saving, setSaving] = useState(false);
  const nodesRef = useRef<Node[]>(defaultNodes);
  const edgesRef = useRef<Edge[]>(defaultEdges);

  const handleChange = useCallback((nodes: Node[], edges: Edge[]) => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const result = await createModel({
        name,
        nodes: nodesRef.current,
        edges: edgesRef.current,
      });
      if (result.success && result.model) {
        router.push(`/models/${result.model._id}/edit`);
      }
    } catch {
      // Could show a toast here
    } finally {
      setSaving(false);
    }
  }, [name, router]);

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/models"
            className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            &larr; Models
          </Link>
          <div className="h-5 w-px bg-slate-700" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-none bg-transparent text-lg font-semibold text-white placeholder-slate-500 outline-none focus:ring-0"
            placeholder="Model name..."
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Model"}
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ModelCanvas
          initialNodes={defaultNodes}
          initialEdges={defaultEdges}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
