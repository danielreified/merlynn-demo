"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react";
import type { Node, Edge, Connection, NodeMouseHandler } from "@xyflow/react";
import { FactorNode } from "./nodes/FactorNode";
import { DecisionNode } from "./nodes/DecisionNode";
import { OutputNode } from "./nodes/OutputNode";
import { FactorEditPanel } from "./FactorEditPanel";

interface ModelCanvasProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onChange: (nodes: Node[], edges: Edge[]) => void;
}

let nodeIdCounter = 0;

function generateNodeId(): string {
  nodeIdCounter += 1;
  return `node_${Date.now()}_${nodeIdCounter}`;
}

function ModelCanvasInner({
  initialNodes,
  initialEdges,
  onChange,
}: ModelCanvasProps): React.JSX.Element {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const nodeTypes = useMemo(
    () => ({
      factor: FactorNode,
      decision: DecisionNode,
      output: OutputNode,
    }),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge(
          { ...connection, style: { stroke: "#475569", strokeWidth: 2 } },
          eds
        );
        onChange(nodes, newEdges);
        return newEdges;
      });
    },
    [setEdges, nodes, onChange]
  );

  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // We need a small delay because state is async
      setTimeout(() => {
        setNodes((currentNodes) => {
          onChange(currentNodes, edges);
          return currentNodes;
        });
      }, 0);
    },
    [onNodesChange, setNodes, edges, onChange]
  );

  const handleEdgesChange: typeof onEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      setTimeout(() => {
        setEdges((currentEdges) => {
          onChange(nodes, currentEdges);
          return currentEdges;
        });
      }, 0);
    },
    [onEdgesChange, setEdges, nodes, onChange]
  );

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNode = useCallback(
    (type: string) => {
      const defaultData: Record<string, Record<string, unknown>> = {
        factor: { label: "New Factor", weight: 50 },
        decision: { label: "New Decision", threshold: 70 },
        output: { label: "New Output", riskLevel: "MEDIUM" },
      };

      const newNode: Node = {
        id: generateNodeId(),
        type,
        position: {
          x: 250 + Math.random() * 200 - 100,
          y: type === "factor" ? 50 : type === "decision" ? 250 : 450,
        },
        data: defaultData[type] || { label: "New Node" },
      };

      setNodes((nds) => {
        const updated = [...nds, newNode];
        onChange(updated, edges);
        return updated;
      });
    },
    [setNodes, edges, onChange]
  );

  const handleNodeUpdate = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) => {
        const updated = nds.map((n) => (n.id === nodeId ? { ...n, data } : n));
        onChange(updated, edges);
        return updated;
      });
      setSelectedNode((prev) => (prev && prev.id === nodeId ? { ...prev, data } : prev));
    },
    [setNodes, edges, onChange]
  );

  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const updated = nds.filter((n) => n.id !== nodeId);
        setEdges((eds) => {
          const updatedEdges = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
          onChange(updated, updatedEdges);
          return updatedEdges;
        });
        return updated;
      });
      setSelectedNode(null);
    },
    [setNodes, setEdges, onChange]
  );

  const miniMapNodeColor = useCallback((node: Node) => {
    switch (node.type) {
      case "factor":
        return "#3b82f6";
      case "decision":
        return "#f59e0b";
      case "output":
        return "#10b981";
      default:
        return "#64748b";
    }
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Floating toolbar */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        <button
          onClick={() => addNode("factor")}
          className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
        >
          + Add Factor
        </button>
        <button
          onClick={() => addNode("decision")}
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
        >
          + Add Decision
        </button>
        <button
          onClick={() => addNode("output")}
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
        >
          + Add Output
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          style: { stroke: "#475569", strokeWidth: 2 },
          type: "smoothstep",
        }}
        fitView
        className="bg-[#0a0f1e]"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e293b" />
        <Controls />
        <MiniMap nodeColor={miniMapNodeColor} pannable zoomable />
      </ReactFlow>

      {selectedNode && (
        <FactorEditPanel
          selectedNode={selectedNode}
          onUpdate={handleNodeUpdate}
          onDelete={handleNodeDelete}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}

export function ModelCanvas(props: ModelCanvasProps): React.JSX.Element {
  return (
    <ReactFlowProvider>
      <ModelCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
