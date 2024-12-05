import { useState, useEffect, useCallback } from "react";
import { QuickJSContext } from "quickjs-emscripten";
import {
  Handle,
  Position,
  useHandleConnections,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";
import styles from "./flow.module.css";
import { db, TCodeBlock } from "@/lib/db";
import { useFlowPyodide } from "./FlowPyodideContext";

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
  const { runTimeRef, interpreterRef, isLoadingInterpreter } = useFlowPyodide();
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [isRunning, setIsRunning] = useState(false);
  const [vmMode, setVmMode] = useState(false);

  const { updateNodeData } = useReactFlow();

  const connections = useHandleConnections({ type: "target" });

  const nodeData = useNodesData(connections?.[0]?.source);

  const pattern = /code-block-(\d+)/;
  const match = id.match(pattern);
  const codeBlockId = match ? parseInt(match[1], 10) : null;
  if (codeBlockId) console.log("CodeBlockSimple codeBlockId", codeBlockId);

  const [codeBlock, setCodeBlock] = useState<TCodeBlock | undefined>(undefined);

  useEffect(() => {
    if (codeBlockId) {
      db.codeBlocks.get(codeBlockId).then((codeBlock) => {
        setCodeBlock(codeBlock);
        console.log("CodeBlockSimple codeBlock", codeBlock);
      });
    }
  }, [codeBlockId]);

  // const [codeBlockInputs, setCodeBlockInputs] = useState(["test1", "test2"]);

  // const output = nodeData?.data ? nodeData.data["value"] : null;

  console.log("CodeBlockSimple connections", connections);
  console.log("CodeBlockSimple nodeData", nodeData);

  const handleRunCode = useCallback(
    (codeInput: string, codeRunInput: string): string => {
      setIsRunning(true);
      let finalResult: string = "";
      const combinedInput = codeInput + "\n" + codeRunInput;
      if (!vmMode) handleReset();
      try {
        if (!interpreterRef || !interpreterRef.current) {
          setIsRunning(false);
          return finalResult;
        }

        if (selectedLanguage === "python") {
          // const pyodide = interpreter;
          // Capture the console output
          // let capturedOutput = '';
          interpreterRef.current.runPython(combinedInput);
          const result = interpreterRef.current.globals.get("global_output");
          finalResult = result.toJs().join("\n");
        } else if (selectedLanguage === "javascript") {
          // const quickjs: QuickJSContext = interpreterRef.current;

          const combinedInputForQuickJS = combinedInput.replace(
            /console\.log\((.*?)\);?/g,
            "$1",
          );
          const result = (interpreterRef.current as QuickJSContext).evalCode(
            combinedInputForQuickJS,
          );

          // console.log('Result:', result);

          // setRunCodeOutput(JSON.stringify(result, null, 0));

          if (result.error) {
            // console.error(interpreterRef.current.dump(result.error));
            const error = interpreterRef.current.dump(result.error);
            finalResult = `Error: ${error.name} - ${error.message}\n`;
          } else {
            // console.log(interpreterRef.current.getString(result.value));
            // setRunCodeOutput(prev => { return `${prev}\n${interpreterRef.current.getString(result.value)}` });
            finalResult = `${JSON.stringify(interpreterRef.current.dump(result.value), null, 0)}\n`;
          }
        }
      } catch (err: any) {
        finalResult = err.toString();
      }

      setIsRunning(false);
      return finalResult;
    },
    [codeBlock, selectedLanguage, interpreterRef, vmMode],
  );

  const handleReset = useCallback(() => {
    // setCodeInput('');
    // setRunCodeOutput('');
    if (interpreterRef?.current) {
      if (selectedLanguage === "python") {
        // Reinitialize Pyodide to reset the Python environment
        interpreterRef.current.globals.clear();
        interpreterRef.current.runPython(`
  import sys
  from js import console
  class ConsoleCapture:
    def write(self, s):
        if s.strip():
            console.log(s)
            global_output.append(s)
    def flush(self):
        pass

  sys.stdout = ConsoleCapture()
  sys.stderr = ConsoleCapture()
  global_output = []
                `);
      } else if (selectedLanguage === "javascript") {
        // Reinitialize QuickJS to reset the JavaScript environment
        interpreterRef.current.dispose();
        interpreterRef.current = runTimeRef!.current.newContext();
      }
    }
    // setRunCodeOutput("");
  }, [codeBlock, selectedLanguage, interpreterRef, runTimeRef]);

  useEffect(() => {
    // const result = (function () {
    //   if (nodeData?.data) {
    //     const output = "hello there!! " + nodeData.data["value"];
    //     return output;
    //   } else {
    //     return null;
    //   }
    // })();

    // updateNodeData(id, { value: { ...data, result } });
    // console.log("CodeBlockSimple result", result);
    // async function getResult() {
    if (!nodeData?.data) return;

    // const result = "hello there!! " + nodeData.data["value"];

    const codeExampleInput = codeBlock?.codeInstances[0].example || "";
    console.log("CodeBlockSimple codeExampleInput", codeExampleInput);
    // const pattern = /(print\([a-zA-Z0-9_]+\()(.+?)(\)\))/;
    const pattern = /(print\()([a-zA-Z0-9_]+\()(.+?)(\)\))/;
    const userInput = (function () {
      if (nodeData?.data?.["value"]?.["result"]) {
        if (typeof nodeData.data["value"]["result"] === "string")
          return nodeData.data["value"]["result"];
      } else if (nodeData?.data?.["value"]) {
        if (typeof nodeData.data["value"] === "string")
          return nodeData.data["value"];
      }
      return "";
    })();
    console.log("CodeBlockSimple userInput", userInput);
    const matchResult = codeExampleInput
      .replace(pattern, (match, p1, p2, p3, p4) => {
        console.log("CodeBlockSimple match", match);
        console.log("CodeBlockSimple p1", p1, "p2", p2, "p3", p3, "p4", p4);
        // return `${p1}${userInput}${p3}`;
        return `${p1}repr(${p2}${userInput}${p4})`;
      })
      .match(pattern);
    if (!matchResult) return;
    console.log("CodeBlockSimple matchResult", matchResult);
    const codeRunInput = matchResult.input;
    console.log("CodeBlockSimple replacedText", codeRunInput);
    const result = handleRunCode(
      codeBlock?.codeInstances[0].code || "",
      codeRunInput,
    );
    updateNodeData(id, { value: { ...data, result } });
    console.log("CodeBlockSimple result", result);
    // }

    // getResult();
  }, [
    nodeData,
    codeBlock,
    handleRunCode,
    selectedLanguage,
    interpreterRef,
    runTimeRef,
    isLoadingInterpreter,
  ]);

  return (
    <div
      className={`${styles.node} shadow bg-white`}
      // style={{
      //   background: data.value
      //     ? `rgb(${data.value.r}, ${data.value.g}, ${data.value.b})`
      //     : "rgb(0, 0, 0)",
      // }}
    >
      {/* {codeBlockInputs.map((input, index) => (
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
      ))} */}
      {codeBlock?.title && (
        <p className="w-full text-center px-2">{codeBlock.title}</p>
      )}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
