import { Handle, useHandleConnections, useNodesData } from "@xyflow/react";
import styles from "./flow.module.css";

export default function OutputNode({ data }) {
  const connections = useHandleConnections({ type: "target" });

  const nodeData = useNodesData(connections?.[0]?.source);

  // const output = nodeData?.data ? nodeData.data["value"] : null;
  const output = (function () {
    if (nodeData?.data?.["value"]?.["result"]) {
      if (typeof nodeData.data["value"]["result"] === "string")
        return nodeData.data["value"]["result"];
    } else if (nodeData?.data?.["value"]) {
      if (typeof nodeData.data["value"] === "string")
        return nodeData.data["value"];
    } else {
      return null;
    }
  })();

  // console.log("OutputNode connections", connections);
  // console.log("OutputNode nodeData", nodeData);
  // console.log("OutputNode output", output);

  return (
    <div
      className={`${styles.numberInput} shadow space-y-1`}
      // style={{
      //   background: color ? `rgb(${color.r}, ${color.g}, ${color.b})` : "white",
      //   color: color ? data.fontColor : "black",
      // }}
    >
      <span>Output</span>
      <p className="font-mono">{output}</p>
      <Handle type="target" position="left" />
    </div>
  );
}
