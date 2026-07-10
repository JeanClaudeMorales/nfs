"use client";

import { useEffect, useMemo, useState } from 'react';
import { ReactFlow, Background, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Icon from './icons';

function StageNode({ data }) {
  return (
    <div className={`flow-node ${data.accent ? 'accent' : ''}`}>
      <Handle type="target" position={Position.Left} className="flow-handle" />
      <span className="flow-node-icon"><Icon name={data.icon} /></span>
      <div className="flow-node-body">
        <span className="flow-node-title">{data.title}</span>
        <span className="flow-node-sub">{data.sub}</span>
      </div>
      <Handle type="source" position={Position.Right} className="flow-handle" />
    </div>
  );
}

const DATA = {
  en: [
    { id: 'cohort', x: 0, y: 130, icon: 'grid', title: 'Patient Cohorts', sub: 'Real-world clinical data' },
    { id: 'omics', x: 265, y: 130, icon: 'sprout', title: 'Immune & Genomic Profiling', sub: 'Multi-omics features' },
    { id: 'model', x: 545, y: 40, icon: 'burst', title: 'AI Immune Model', sub: 'Learns the disease mechanism', accent: true },
    { id: 'twin', x: 545, y: 235, icon: 'twin', title: 'Patient Digital Twin', sub: 'Simulate immune response' },
    { id: 'molecules', x: 840, y: 130, icon: 'orbit', title: 'Candidate Molecules', sub: 'Generative + screening' },
    { id: 'validate', x: 1110, y: 130, icon: 'shield', title: 'In-silico Validation', sub: 'Safety & efficacy' },
    { id: 'cure', x: 1360, y: 130, icon: 'saturn', title: 'Therapy Candidate', sub: 'Autoimmune target', accent: true },
  ],
  es: [
    { id: 'cohort', x: 0, y: 130, icon: 'grid', title: 'Cohortes de Pacientes', sub: 'Datos clínicos reales' },
    { id: 'omics', x: 265, y: 130, icon: 'sprout', title: 'Perfil Inmune y Genómico', sub: 'Características multi-ómicas' },
    { id: 'model', x: 545, y: 40, icon: 'burst', title: 'Modelo Inmune IA', sub: 'Aprende el mecanismo', accent: true },
    { id: 'twin', x: 545, y: 235, icon: 'twin', title: 'Gemelo Digital', sub: 'Simula respuesta inmune' },
    { id: 'molecules', x: 840, y: 130, icon: 'orbit', title: 'Moléculas Candidatas', sub: 'Generativo + cribado' },
    { id: 'validate', x: 1110, y: 130, icon: 'shield', title: 'Validación In-silico', sub: 'Seguridad y eficacia' },
    { id: 'cure', x: 1360, y: 130, icon: 'saturn', title: 'Candidato Terapéutico', sub: 'Diana autoinmune', accent: true },
  ],
};

const EDGES = [
  ['cohort', 'omics'], ['omics', 'model'], ['omics', 'twin'],
  ['model', 'molecules'], ['twin', 'molecules'], ['molecules', 'validate'], ['validate', 'cure'],
];

export default function AutoimmuneFlow({ lang = 'en' }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const nodeTypes = useMemo(() => ({ stage: StageNode }), []);
  const nodes = useMemo(
    () => DATA[lang].map((n) => ({ id: n.id, type: 'stage', position: { x: n.x, y: n.y }, data: n })),
    [lang]
  );
  const edges = useMemo(
    () => EDGES.map(([s, t]) => ({
      id: `${s}-${t}`, source: s, target: t, animated: true,
      style: { stroke: '#c8632a', strokeWidth: 1.5 },
    })),
    []
  );

  if (!mounted) return <div className="flow-canvas" />;

  return (
    <div className="flow-canvas">
      <ReactFlow
        nodeTypes={nodeTypes}
        defaultNodes={nodes}
        defaultEdges={edges}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
      >
        <Background gap={26} size={1} color="rgba(17,18,20,0.06)" />
      </ReactFlow>
    </div>
  );
}
