import { useCallback, useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import styles from "./flow.module.css";

export default function TextInput({ id, data }) {
  const { updateNodeData } = useReactFlow();
  const [input, setInput] = useState(data.value);

  const onChange = useCallback((evt) => {
    const newInput = evt.target.value;
    setInput(newInput);
    updateNodeData(id, { value: newInput });
  }, []);

  return (
    <div className={`${styles.numberInput} shadow space-y-1`}>
      <div>{data.label}</div>
      <textarea
        id={`number-${id}`}
        name="number"
        onChange={onChange}
        className="nodrag font-mono border rounded p-1"
        value={input}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
