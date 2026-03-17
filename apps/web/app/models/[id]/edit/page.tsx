"use client";

import React, { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Node, Edge } from "@xyflow/react";
import { ModelCanvas } from "@/components/models/ModelCanvas";
import { Badge } from "@merlynn/ui";
import { getModel, updateModel } from "@/app/actions/models";

interface ModelData {
  _id: string;
  name: string;
  status: string;
  nodes: Node[];
  edges: Edge[];
  updatedAt: string;
}

function statusBadgeVariant(status: string): "high" | "medium" | "low" {
  switch (status) {
    case "deployed":
      return "low";
    case "training":
      return "medium";
    default:
      return "high";
  }
}

export default function EditModelPage(): React.JSX.Element {
  const params = useParams();
  const id = params.id as string;

  const [model, setModel] = useState<ModelData | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch model via server action
  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getModel(id);
        if (data) {
          setModel(data as unknown as ModelData);
          setName(data.name);
          nodesRef.current = data.nodes as Node[];
          edgesRef.current = data.edges as Edge[];
        } else {
          setError("Model not found");
        }
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }, [id]);

  const saveModel = useCallback(async () => {
    setSaving(true);
    try {
      await updateModel(id, {
        name,
        nodes: nodesRef.current,
        edges: edgesRef.current,
      });
    } catch {
      // Could show error toast
    } finally {
      setSaving(false);
    }
  }, [id, name]);

  // Debounced auto-save on canvas changes
  const handleChange = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      nodesRef.current = nodes;
      edgesRef.current = edges;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        void saveModel();
      }, 1500);
    },
    [saveModel]
  );

  // Auto-save on name change
  useEffect(() => {
    if (!model || name === model.name) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      void saveModel();
    }, 1500);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [name, model, saveModel]);

  if (isPending && !model) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-400">
          {error ?? "Model not found"}
        </div>
      </div>
    );
  }

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
          <Badge variant={statusBadgeVariant(model.status)}>{model.status}</Badge>
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="animate-pulse text-xs text-slate-400">Saving...</span>}
          <button
            onClick={() => void saveModel()}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            Save
          </button>
          <Link
            href={`/models/${id}/train`}
            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            Train Model
          </Link>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ModelCanvas
          initialNodes={model.nodes}
          initialEdges={model.edges}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
