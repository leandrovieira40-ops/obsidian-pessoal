"use client";

import { useEffect, useRef, useState } from "react";

export type GraphNode = { id: string; label: string; tags: string[]; summary: string | null };
export type GraphEdge = { from: string; to: string };

const PALETTE = ["#b2552e", "#3f7d6b", "#5a6ab0", "#b0923f", "#8a4f9e", "#4f8ab0"];

export default function GraphView({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    let network: import("vis-network/standalone").Network | null = null;

    (async () => {
      const { DataSet } = await import("vis-data");
      const { Network } = await import("vis-network/standalone");
      type VisNode = { id: string; label: string; title: string; color: object; font: object };
      type VisEdge = { id: string; from: string; to: string; color: object };

      const tagColor: Record<string, string> = {};
      let colorIndex = 0;
      const colorFor = (tags: string[]) => {
        const key = tags[0] ?? "_";
        if (!tagColor[key]) tagColor[key] = PALETTE[colorIndex++ % PALETTE.length];
        return tagColor[key];
      };

      const visNodes = new DataSet<VisNode>(
        nodes.map((n) => ({
          id: n.id,
          label: n.label,
          title: n.summary ?? n.label,
          color: { background: colorFor(n.tags), border: "transparent" },
          font: { color: "#fff", size: 13 },
        })),
      );
      const visEdges = new DataSet<VisEdge>(
        edges.map((e) => ({
          id: `${e.from}-${e.to}`,
          from: e.from,
          to: e.to,
          color: { color: "#9a927f", opacity: 0.5 },
        })),
      );

      network = new Network(
        containerRef.current!,
        { nodes: visNodes, edges: visEdges },
        {
          physics: { stabilization: true, barnesHut: { gravitationalConstant: -3000, springLength: 140 } },
          interaction: { hover: true, tooltipDelay: 100 },
          nodes: { shape: "dot", size: 16 },
        },
      );

      network.on("click", (params: { nodes: string[] }) => {
        if (params.nodes.length === 0) {
          setSelected(null);
          return;
        }
        const node = nodes.find((n) => n.id === params.nodes[0]) ?? null;
        setSelected(node);
      });
    })();

    return () => network?.destroy();
  }, [nodes, edges]);

  if (nodes.length === 0) {
    return (
      <p className="text-sm text-[#6b6558] dark:text-[#a39b89] p-6">
        Nenhuma nota ainda — registre a primeira em &ldquo;Notas&rdquo; para ver o grafo.
      </p>
    );
  }

  return (
    <div className="relative flex-1">
      <div ref={containerRef} className="w-full h-[calc(100vh-57px)]" />
      {selected && (
        <div className="absolute top-4 right-4 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-[#e5e1da] dark:border-[#3a352c] bg-white dark:bg-[#242019] p-4 shadow-lg">
          <h2 className="text-sm font-semibold mb-1">{selected.label}</h2>
          <div className="flex gap-1 flex-wrap mb-2">
            {selected.tags.map((t) => (
              <span key={t} className="text-[11px] rounded-full bg-[#b2552e] text-white px-2 py-0.5">
                {t}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#6b6558] dark:text-[#a39b89]">{selected.summary}</p>
        </div>
      )}
    </div>
  );
}
