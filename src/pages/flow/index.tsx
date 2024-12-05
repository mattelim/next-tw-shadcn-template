import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { db } from "@/lib/db";

import NumberInput from "@/components/flow/NumberInput";
import ColorPreview from "@/components/flow/ColorPreview";
import Lightness from "@/components/flow/Lightness";
import Log from "@/components/flow/Log";
import TextInput from "@/components/flow/TextInput";
import OutputNode from "@/components/flow/OutputNode";
import CodeBlockSimple from "@/components/flow/CodeBlockSimple";

import { FlowPyodideProvider } from "@/components/flow/FlowPyodideContext";

const nodeTypes = {
  NumberInput,
  ColorPreview,
  Lightness,
  Log,
  TextInput,
  OutputNode,
  CodeBlockSimple,
};

// const initialNodes = [
//   {
//     type: "TextInput",
//     id: "t1",
//     data: { label: "Input", value: "'example text input'" },
//     position: { x: 0, y: 200 },
//   },
//   {
//     type: "CodeBlockSimple",
//     id: "code-block-2",
//     position: { x: 300, y: 200 },
//     data: {
//       label: "code-block-2",
//       value: { bid: undefined, result: undefined },
//     },
//   },
//   {
//     type: "CodeBlockSimple",
//     id: "code-block-5",
//     position: { x: 500, y: 400 },
//     data: {
//       label: "code-block-5",
//       value: { bid: undefined, result: undefined },
//     },
//   },
//   {
//     id: "output",
//     type: "OutputNode",
//     position: { x: 650, y: 400 },
//     data: { label: "Output" },
//   },
//   {
//     id: "output-2",
//     type: "OutputNode",
//     position: { x: 0, y: 0 },
//     data: { label: "Output" },
//   },
//   {
//     id: "output-3",
//     type: "OutputNode",
//     position: { x: 0, y: 0 },
//     data: { label: "Output" },
//   },
//   {
//     id: "output-4",
//     type: "OutputNode",
//     position: { x: 0, y: 0 },
//     data: { label: "Output" },
//   },
//   {
//     id: "output-5",
//     type: "OutputNode",
//     position: { x: 0, y: 0 },
//     data: { label: "Output" },
//   },
//   {
//     id: "output-6",
//     type: "OutputNode",
//     position: { x: 0, y: 0 },
//     data: { label: "Output" },
//   },
// ];

const initialNodes = [];

for (let i = 1; i <= 10; i++) {
  initialNodes.push({
    type: "TextInput",
    id: `t${i}`,
    data: { label: `Input ${i}`, value: `'example text input'` },
    position: { x: 0, y: 0 },
  });
}

for (let i = 1; i <= 10; i++) {
  initialNodes.push({
    type: "OutputNode",
    id: `output-${i}`,
    position: { x: 0, y: 120 },
    data: { label: `Output ${i}` },
  });
}

for (let i = 1; i < 7; i++) {
  initialNodes.push({
    type: "CodeBlockSimple",
    id: `code-block-${i}`,
    position: { x: 0, y: 200 + i * 200 },
    data: {
      label: `code-block-${i}`,
      value: { bid: undefined, result: undefined },
    },
  });
}

const initialEdges = [];
// const initialEdges = [
//   {
//     id: "edge-test-1",
//     source: "t1",
//     target: "code-block-2",
//   },
//   {
//     id: "edge-test-2",
//     source: "code-block-2",
//     target: "output",
//   },
// ];

function ReactiveFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );
  return (
    <div className="w-screen h-screen text-sm">
      <FlowPyodideProvider>
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </FlowPyodideProvider>
    </div>
  );
}

export default ReactiveFlow;
