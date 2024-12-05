import { useState, useEffect } from "react";
import {
  Handle,
  Position,
  useHandleConnections,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";
import styles from "./flow.module.css";
import { db } from "@/lib/db";

function CustomHandle({ id, label, onChange, style }) {
  const connections = useHandleConnections({
    type: "target",
    id,
  });

  const nodeData = useNodesData(connections?.[0]?.source);

  useEffect(() => {
    onChange(nodeData?.data ? nodeData?.data?.value : 0);
  }, [nodeData]);

  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        id={id}
        className="handle"
        style={style}
      />
      <label
        htmlFor={id}
        className="absolute ml-2 -translate-y-3"
        style={style}
      >
        {label}
      </label>
    </div>
  );
}

export default function CodeBlockSimple({ id, data }) {
  const { updateNodeData } = useReactFlow();

  const connections = useHandleConnections({ type: "target" });

  const nodeData = useNodesData(connections?.[0]?.source);

  const [codeBlockInputs, setCodeBlockInputs] = useState(["test1", "test2"]);

  // const output = nodeData?.data ? nodeData.data["value"] : null;

  console.log("CodeBlockSimple connections", connections);
  console.log("CodeBlockSimple nodeData", nodeData);

  useEffect(() => {
    const result = (function () {
      if (nodeData?.data) {
        const output = "hello there!! " + nodeData.data["value"];
        return output;
      } else {
        return null;
      }
    })();

    updateNodeData(id, { value: { ...data, result } });
    console.log("CodeBlockSimple result", result);
  }, [nodeData]);

  return (
    <div
      className={`${styles.node} shadow bg-white`}
      // style={{
      //   background: data.value
      //     ? `rgb(${data.value.r}, ${data.value.g}, ${data.value.b})`
      //     : "rgb(0, 0, 0)",
      // }}
    >
      {/* <CustomHandle
        id="red"
        label="R"
        onChange={(value) => {
          updateNodeData(id, (node) => {
            return { value: { ...node.data.value, r: value } };
          });
        }}
      />
      <CustomHandle
        id="green"
        label="G"
        onChange={(value) => {
          updateNodeData(id, (node) => {
            return { value: { ...node.data.value, g: value } };
          });
        }}
      />
      <CustomHandle
        id="blue"
        label="B"
        onChange={(value) => {
          updateNodeData(id, (node) => {
            return { value: { ...node.data.value, b: value } };
          });
        }}
      /> */}
      {codeBlockInputs.map((input, index) => (
        <CustomHandle
          id={input}
          label={input}
          onChange={(value) => {
            updateNodeData(id, (node) => {
              return { value: { ...node.data.value, [input]: value } };
            });
          }}
          style={{
            top: `${((index + 1) / (codeBlockInputs.length + 1)) * 100}%`,
          }}
        />
      ))}
      {/* <Handle type="target" position={Position.Left} id="test1" />
      <Handle type="target" position={Position.Left} id="test2" /> */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
