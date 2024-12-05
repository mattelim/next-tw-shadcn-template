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

const initialNodes = [
  {
    type: "NumberInput",
    id: "1",
    data: { label: "Red", value: 255 },
    position: { x: 0, y: 0 },
  },
  {
    type: "NumberInput",
    id: "2",
    data: { label: "Green", value: 0 },
    position: { x: 0, y: 100 },
  },
  {
    type: "NumberInput",
    id: "3",
    data: { label: "Blue", value: 115 },
    position: { x: 0, y: 200 },
  },
  {
    type: "TextInput",
    id: "t1",
    data: { label: "Input", value: "'example text input'" },
    position: { x: 0, y: 200 },
  },
  {
    type: "ColorPreview",
    id: "color",
    position: { x: 150, y: 50 },
    data: {
      label: "Color",
      value: { r: undefined, g: undefined, b: undefined },
    },
  },
  {
    type: "CodeBlockSimple",
    id: "code-block-2",
    position: { x: 300, y: 200 },
    data: {
      label: "code-block-2",
      value: { bid: undefined, result: undefined },
    },
  },
  {
    type: "CodeBlockSimple",
    id: "code-block-5",
    position: { x: 500, y: 400 },
    data: {
      label: "code-block-5",
      value: { bid: undefined, result: undefined },
    },
  },
  {
    type: "Lightness",
    id: "lightness",
    position: { x: 350, y: 75 },
    data: {},
  },
  {
    id: "log-1",
    type: "Log",
    position: { x: 500, y: 0 },
    data: { label: "Use black font", fontColor: "black" },
  },
  {
    id: "log-2",
    type: "Log",
    position: { x: 500, y: 140 },
    data: { label: "Use white font", fontColor: "white" },
  },
  {
    id: "output",
    type: "OutputNode",
    position: { x: 650, y: 400 },
    data: { label: "Output" },
  },
  {
    id: "output-2",
    type: "OutputNode",
    position: { x: 650, y: 400 },
    data: { label: "Output" },
  },
  {
    id: "output-3",
    type: "OutputNode",
    position: { x: 650, y: 400 },
    data: { label: "Output" },
  },
];

const initialEdges = [
  {
    id: "1-color",
    source: "1",
    target: "color",
    targetHandle: "red",
  },
  {
    id: "2-color",
    source: "2",
    target: "color",
    targetHandle: "green",
  },
  {
    id: "3-color",
    source: "3",
    target: "color",
    targetHandle: "blue",
  },
  {
    id: "color-lightness",
    source: "color",
    target: "lightness",
  },
  {
    id: "lightness-log-1",
    source: "lightness",
    sourceHandle: "light",
    target: "log-1",
  },
  {
    id: "lightness-log-2",
    source: "lightness",
    sourceHandle: "dark",
    target: "log-2",
  },
  {
    id: "edge-test-1",
    source: "t1",
    target: "code-block-2",
  },
  {
    id: "edge-test-2",
    source: "code-block-2",
    target: "output",
  },
];

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
