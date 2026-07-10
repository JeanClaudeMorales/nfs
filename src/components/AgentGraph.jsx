"use client";

// A lightweight, sci-fi "multi-agent orchestration" node graph. Pure SVG with
// CSS animations (flowing edges + pulsing nodes) — no per-frame JS, no deps.
// Conveys a live AI simulation without React Flow's weight.
const NODES = [
  { id: 'core', x: 300, y: 170, r: 26, label: 'Orchestrator', core: true },
  { id: 'llm', x: 120, y: 70, r: 15, label: 'LLM' },
  { id: 'rag', x: 110, y: 250, r: 15, label: 'RAG' },
  { id: 'vision', x: 300, y: 40, r: 13, label: 'Vision' },
  { id: 'agent', x: 490, y: 80, r: 15, label: 'Agent' },
  { id: 'data', x: 500, y: 250, r: 15, label: 'Data' },
  { id: 'decide', x: 300, y: 300, r: 13, label: 'Decision' },
];
const EDGES = [
  ['core', 'llm'], ['core', 'rag'], ['core', 'vision'],
  ['core', 'agent'], ['core', 'data'], ['core', 'decide'],
];
const by = Object.fromEntries(NODES.map((n) => [n.id, n]));

export default function AgentGraph() {
  return (
    <svg className="agent-graph" viewBox="0 0 600 340" width="100%" role="img" aria-label="Multi-agent orchestration">
      <defs>
        <radialGradient id="agCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f3f3f4" />
          <stop offset="100%" stopColor="#e4e4e7" />
        </radialGradient>
      </defs>

      {EDGES.map(([a, b], i) => {
        const p = by[a], q = by[b];
        return (
          <g key={i}>
            <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} className="ag-edge" />
            <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} className="ag-flow" style={{ animationDelay: `${i * 0.4}s` }} />
          </g>
        );
      })}

      {NODES.map((n, i) => (
        <g key={n.id} className="ag-node">
          {n.core && <circle cx={n.x} cy={n.y} r={n.r + 12} className="ag-halo" />}
          <circle cx={n.x} cy={n.y} r={n.r} fill={n.core ? 'url(#agCore)' : '#111214'} className={n.core ? 'ag-core' : 'ag-dot'} />
          {!n.core && <circle cx={n.x} cy={n.y} r={n.r} className="ag-ping" style={{ animationDelay: `${(i * 0.37) % 2}s` }} />}
          <text x={n.x} y={n.core ? n.y + 4 : n.y - n.r - 8} className={`ag-label ${n.core ? 'core' : ''}`}>{n.label}</text>
        </g>
      ))}
    </svg>
  );
}
