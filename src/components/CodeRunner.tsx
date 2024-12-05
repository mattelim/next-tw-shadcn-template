import React, { useState, useEffect, useCallback } from "react";
import { QuickJSContext } from "quickjs-emscripten";
import { useRouter } from "next/router";
// import { loadPyodide } from "pyodide";  // tried, doesn't work

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "./ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";

import CodeEditor from "./CodeEditor";
// import { languages } from "./CodeRunnerWrapper";
import { capitalizeFirstLetter } from "@/lib/utils";
import { db, TCodeBlock } from "@/lib/db";
// import { useRouter } from "next/router";

import { languages, TModelQuality, useInterpreterLoader } from "@/lib/utils";

export type CodeRunnerProps = {
  selectedLanguage: languages;
  setSelectedLanguage: React.Dispatch<React.SetStateAction<languages>>;
  promptInput: string;
  setPromptInput: React.Dispatch<React.SetStateAction<string>>;
  pseudocodeInput: string;
  setPseudocodeInput: React.Dispatch<React.SetStateAction<string>>;
  codeInput: string;
  setCodeInput: React.Dispatch<React.SetStateAction<string>>;
  codeExampleInput: string;
  setCodeExampleInput: React.Dispatch<React.SetStateAction<string>>;
  showCodeExample: boolean;
  setShowCodeExample: React.Dispatch<React.SetStateAction<boolean>>;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  vmMode: boolean;
  setVmMode: React.Dispatch<React.SetStateAction<boolean>>;
  modelQuality: TModelQuality;
  setModelQuality: React.Dispatch<React.SetStateAction<TModelQuality>>;
  codeBlockTitle: string;
  setCodeBlockTitle: React.Dispatch<React.SetStateAction<string>>;
  codeBlockId?: number;
  isValuesChanged?: boolean;
  setUpdateCount?: React.Dispatch<React.SetStateAction<number>>;
};

export default function CodeRunner({
  selectedLanguage,
  setSelectedLanguage,
  promptInput,
  setPromptInput,
  pseudocodeInput,
  setPseudocodeInput,
  codeInput,
  setCodeInput,
  codeExampleInput,
  setCodeExampleInput,
  showCodeExample,
  setShowCodeExample,
  isRunning,
  setIsRunning,
  vmMode,
  setVmMode,
  modelQuality,
  setModelQuality,
  codeBlockTitle,
  setCodeBlockTitle,
  codeBlockId,
  isValuesChanged,
  setUpdateCount,
}: CodeRunnerProps) {
  const [runCodeOutput, setRunCodeOutput] = useState("");
  const router = useRouter();

  // const { pyodide, isLoadingPyodide } = usePyodideLoader();
  const { runTimeRef, interpreterRef, isLoadingInterpreter } =
    useInterpreterLoader(selectedLanguage);

  function errorAlertHandler(error: unknown) {
    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert(String(error));
    }
  }

  async function promptToPseudocodeSubmit(event: React.FormEvent) {
    event.preventDefault();
    // setlogMsg("");
    // setWaiting(true);
    // setResult("// Please be patient, this may take a while...");
    // setSelVal("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_REMOTE_API_URL || ""}/api/prompt-to-pseudocode`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: promptInput, modelQuality }),
        },
      );

      const data = await response.json();
      if (response.status !== 200) {
        // setWaiting(false);
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      // setResult(data.code);
      // setSandboxRunning(true);
      // setWaiting(false);
      // handleGenClick();
      setPseudocodeInput(data.data);
    } catch (error) {
      console.error(error);
      errorAlertHandler(error);
      // setWaiting(false);
    }
  }

  function separateCodeExample(combined: string): {
    code: string;
    example: string;
  } {
    const codePattern =
      selectedLanguage === "python"
        ? /# \$CODE_START([\s\S]*?)# \$CODE_END/
        : /\/\/ \$CODE_START([\s\S]*?)\/\/ \$CODE_END/;

    const examplePattern =
      selectedLanguage === "python"
        ? /# \$EXAMPLE_START([\s\S]*?)# \$EXAMPLE_END/
        : /\/\/ \$EXAMPLE_START([\s\S]*?)\/\/ \$EXAMPLE_END/;

    const codeMatch = combined.match(codePattern);
    const exampleMatch = combined.match(examplePattern);

    return {
      code: codeMatch ? codeMatch[1].trim() : "",
      example: exampleMatch ? exampleMatch[1].trim() : "",
    };
  }

  async function pseudocodeToCodeSubmit(event: React.FormEvent) {
    event.preventDefault();
    // setlogMsg("");
    // setWaiting(true);
    // setResult("// Please be patient, this may take a while...");
    // setSelVal("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_REMOTE_API_URL || ""}/api/pseudocode-to-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: pseudocodeInput,
            selectedLanguage,
            modelQuality,
          }),
        },
      );

      const data = await response.json();
      if (response.status !== 200) {
        // setWaiting(false);
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      // setResult(data.code);
      // setSandboxRunning(true);
      // setWaiting(false);
      // handleGenClick();
      const { code, example } = separateCodeExample(data.data);
      if (!code || !example) {
        setShowCodeExample(false);
        setCodeInput(data.data);
      } else {
        setShowCodeExample(true);
        setCodeInput(code);
        setCodeExampleInput(example);
      }
    } catch (error) {
      console.error(error);
      errorAlertHandler(error);
      // setWaiting(false);
    }
  }

  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    const combinedInput = codeInput + "\n" + codeExampleInput;
    if (!vmMode) handleReset();
    try {
      if (selectedLanguage === "python") {
        // const pyodide = interpreter;
        // Capture the console output
        // let capturedOutput = '';
        interpreterRef.current.runPython(combinedInput);
        const result = interpreterRef.current.globals.get("global_output");
        setRunCodeOutput(result.toJs().join("\n"));
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
          setRunCodeOutput((prev) => {
            return `${prev}Error: ${error.name} - ${error.message}\n`;
          });
        } else {
          // console.log(interpreterRef.current.getString(result.value));
          // setRunCodeOutput(prev => { return `${prev}\n${interpreterRef.current.getString(result.value)}` });
          setRunCodeOutput((prev) => {
            return `${prev}${JSON.stringify(interpreterRef.current.dump(result.value), null, 0)}\n`;
          });
        }
      }
    } catch (err: any) {
      setRunCodeOutput(err.toString());
    }

    setIsRunning(false);
  }, [codeInput, codeExampleInput, selectedLanguage, interpreterRef, vmMode]);

  const handleReset = useCallback(() => {
    // setCodeInput('');
    // setRunCodeOutput('');
    if (interpreterRef.current) {
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
        interpreterRef.current = runTimeRef.current.newContext();
      }
    }
    setRunCodeOutput("");
  }, [selectedLanguage, interpreterRef, runTimeRef]);

  useEffect(() => {
    if (!vmMode) handleReset();
  }, [vmMode]);

  // whenever runCodeOutput changes, scroll to the bottom of the output container
  useEffect(() => {
    const outputContainer = document.getElementById(
      "run-code-output-container",
    );
    if (outputContainer) {
      outputContainer.scrollTop = outputContainer.scrollHeight;
    }
  }, [runCodeOutput]);

  async function handleSaveCodeBlock(event: React.FormEvent) {
    event.preventDefault();
    try {
      const codeBlockObj: Omit<TCodeBlock, "id"> = {
        title: codeBlockTitle,
        prompt: promptInput,
        pseudocode: pseudocodeInput,
        codeInstances: [
          {
            programmingLanguage: selectedLanguage,
            code: codeInput,
            example: codeExampleInput,
          },
        ],
        metaData: {
          createdAt: new Date(),
          updatedAt: new Date(),
          modelUsed: modelQuality,
          createdBy: "",
        },
      };
      if (codeBlockId) {
        await db.codeBlocks.update(codeBlockId, codeBlockObj);
        console.log("Updated code block with id:", codeBlockId);
        // router.push(`/code-block/${codeBlockId}`);
        if (setUpdateCount) setUpdateCount((prev) => prev + 1);
      } else {
        const id = await db.codeBlocks.add(codeBlockObj);
        console.log("Saved code block with id:", id);
        router.push(`/code-block/${id}`);
      }
    } catch (error) {
      console.error(error);
      errorAlertHandler(error);
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full sticky">
        <div className="top-4 flex items-center m-4 p-4 border border-border rounded-md justify-between bg-white/90 backdrop-blur-md hover:bg-white transition-all">
          <div className="flex items-center gap-2">
            <Button
              className="aspect-square p-0 [&_svg]:size-5"
              variant={"ghost"}
              onClick={() => router.push("/")}
            >
              <ArrowLeft />
            </Button>
            <input
              type="text"
              placeholder="Title"
              value={codeBlockTitle}
              onChange={(e) => setCodeBlockTitle(e.target.value)}
              className="p-2 rounded-md w-96 text-lg font-semibold"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>Model Quality</span>
            <Select
              onValueChange={(value) => {
                setModelQuality(value as TModelQuality);
                // setCodeInput('');
                // setRunCodeOutput('');
              }}
              value={modelQuality}
            >
              <SelectTrigger className="w-max">
                <SelectValue placeholder="Select model quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low </SelectItem>
                <SelectItem value="high">High </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            className="p-0 aspect-square [&_svg]:size-6"
            disabled={codeBlockId === undefined ? false : !isValuesChanged}
            onClick={handleSaveCodeBlock}
          >
            <Save strokeWidth={1.5} />
          </Button>
        </div>
      </div>
      <div className="space-y-8 w-full p-4 max-w-3xl flex flex-col">
        {/* <div className="w-[180px]">
        <select className="w-full rounded p-2 bg-" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div> */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold">Prompt</h3>
          <Textarea
            rows={3}
            cols={50}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder={`Enter your function prompt here...`}
            className="font-mono text-base border p-2 rounded-md w-full overflow-scroll"
          />
          <div className="w-full flex justify-end gap-2">
            <Button
              onClick={promptToPseudocodeSubmit}
              className="w-52"
              // disabled={isRunning || isLoadingInterpreter}
            >
              Generate pseudocode
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-semibold">Pseudocode</h3>
          <Textarea
            rows={12}
            cols={100}
            value={pseudocodeInput}
            onChange={(e) => setPseudocodeInput(e.target.value)}
            placeholder={`Enter your function pseudocode here...`}
            className="font-mono text-base border p-2 rounded-md w-full overflow-scroll"
          />
        </div>

        <div className="flex justify-between">
          <div className="flex gap-4">
            <Select
              onValueChange={(value) => {
                setSelectedLanguage(value as languages);
                // setCodeInput('');
                // setRunCodeOutput('');
              }}
              value={selectedLanguage}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Programming Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm gap-2">
              <p className=" shrink-0">VM Mode</p>
              <Switch
                checked={vmMode}
                onCheckedChange={() => setVmMode(!vmMode)}
              />
            </div>
          </div>
          <div className="w-full flex justify-end gap-2">
            <Button
              onClick={pseudocodeToCodeSubmit}
              className="w-52"
              // disabled={isRunning || isLoadingInterpreter}
            >
              Generate {capitalizeFirstLetter(selectedLanguage)} code
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-semibold">
            {capitalizeFirstLetter(selectedLanguage)} Code
          </h3>
          {/* <textarea
          rows={10}
          cols={50}
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          placeholder={`Enter your ${selectedLanguage} code here...`}
          className='font-mono border p-2 rounded-md w-full overflow-scroll'
        /> */}
          {/* <Textarea
          rows={10}
          cols={50}
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          placeholder={`Enter your ${selectedLanguage} code here...`}
          className='font-mono text-base border p-2 rounded-md w-full overflow-scroll'
        /> */}
          <CodeEditor
            input={codeInput}
            setInput={setCodeInput}
            selectedLanguage={selectedLanguage}
            editorHeight="300px"
          />
          {showCodeExample && (
            <>
              <h3 className="font-semibold">Example</h3>
              <CodeEditor
                input={codeExampleInput}
                setInput={setCodeExampleInput}
                selectedLanguage={selectedLanguage}
                editorHeight="100px"
              />
            </>
          )}
          <div className="w-full flex justify-end gap-2">
            {vmMode && (
              <Button
                onClick={handleReset}
                disabled={isRunning || isLoadingInterpreter}
                className="w-52"
              >
                Reset REPL
              </Button>
            )}
            <Button
              onClick={handleRunCode}
              disabled={isRunning || isLoadingInterpreter}
              className="w-52"
            >
              {isLoadingInterpreter
                ? "Loading Pyodide..."
                : isRunning
                  ? "Running..."
                  : `Run ${capitalizeFirstLetter(selectedLanguage)} Code`}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 pb-20">
          <h3 className="font-semibold">Output</h3>
          <pre
            id="run-code-output-container"
            className="border p-2 rounded-md w-full h-40 overflow-scroll "
          >
            {runCodeOutput}
          </pre>
        </div>
      </div>
    </div>
  );
}

// export default memo(CodeRunner);

// In the HTML file, you need to load Pyodide before the app starts
// Add this to your public/index.html file:
// <script defer src="https://cdn.jsdelivr.net/pyodide/v0.23.0/full/pyodide.js"></script>

// Usage:
// 1. Paste this file in src/App.js of a new React project.
// 2. Make sure to update the index.html with the Pyodide script, as mentioned above.
// 3. Run `npm start` or `yarn start` to see your app in action.
