import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getQuickJS,
  // QuickJSWASMModule,
  QuickJSContext,
  QuickJSRuntime
} from 'quickjs-emscripten'

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from './ui/switch';
import { Textarea } from "@/components/ui/textarea";

import CodeEditor from './CodeEditor';
import { languages } from './CodeRunnerWrapper';
import { capitalizeFirstLetter } from '@/lib/utils';

// import './App.css';
// let pyodide: any;
// let opal: any;
// let quickjsWasm: any;
// let interpreter: any;
// let runTime: any;

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
  }
}

const useInterpreterLoader = (language: string) => {
  // const [isLoadingPyodide, setIsLoadingPyodide] = useState(true);
  // const [isLoadingOpal, setIsLoadingOpal] = useState(true);
  // const [isLoadingQuickJS, setIsLoadingQuickJS] = useState(true);
  const runTimeRef = useRef<any>();
  const interpreterRef = useRef<any>();
  const [isLoadingInterpreter, setIsLoadingInterpreter] = useState(true);

  useEffect(() => {
    setIsLoadingInterpreter(true);
    console.log("Loading interpreter for language:", language);
    // const loadPyodide = async () => {
    //   if (!pyodide) {
    //     pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.0/full/' });
    //   }
    //   setIsLoadingPyodide(false);
    // };
    // loadPyodide();
    const loadInterpreter = async () => {
      // if (!interpreterRef.current) {
      switch (language) {
        case 'python': {
          // runTime = undefined;
          runTimeRef.current = undefined;
          interpreterRef.current = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.0/full/' });
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
          console.log("Python interpreter loaded");

          // load optional packages
          // await interpreterRef.current.loadPackage("micropip");
          // await pyodide.loadPackage("numpy");

          break;
        }
        case 'javascript': {
          // interpreter = await getQuickJS();

          // == runtime == //

          const quickJS = await getQuickJS();
          //       interpreter.evalCode(`
          //   globalThis.console = {
          //     log: (msg) => { _sendToHost(String(msg)); },
          //     error: (msg) => { _sendToHost("Error: " + String(msg)); },
          //   };
          // `);

          //       // Define `_sendToHost` to call back to the host's `captureOutput`
          //       interpreter.evalCode('globalThis._sendToHost = (msg) => callHostFunction(msg);', {
          //         callHostFunction: (msg) => setRunCodeOutput(interpreter.getString(msg))
          //       });
          // interpreter = new QuickJSWASMModule(QuickJSEmscriptenModule, QuickJSFFI);
          runTimeRef.current = quickJS.newRuntime();
          const runTimeTyped = runTimeRef.current as QuickJSRuntime;

          interpreterRef.current = runTimeTyped.newContext();
          // const interpreterTyped = interpreter as QuickJSContext;

          // const interpreter = ctx;
          // let test = interpreterTyped.evalCode(`let a = 1; let b = 2; a + b;`);
          // test = interpreterTyped.evalCode(`a - b;`);
          // // let test = quickJS.evalCode(`console.log("Hello, World!");`);
          // // console.log("Test:", test.unwrap());
          // if (test.error) {
          //   console.error(interpreterTyped.dump(test.error));
          // } else {
          //   console.log(interpreterTyped.getString(test.value));
          // }
          console.log("JavaScript interpreter loaded");
          break;
        }
        // case 'ruby': {
        //   interpreter = await window.loadOpal({ indexURL: 'https://cdn.opalrb.com/opal/current/' });
        //   break;
        // }
      }
      setIsLoadingInterpreter(false);
    }
    // }
    loadInterpreter();

    // return () => {
    //   if (interpreterRef.current) {
    //     if (language === 'python') {
    //       interpreterRef
  }, [language]);

  return { runTimeRef, interpreterRef, isLoadingInterpreter };
};

export default function CodeRunner(
  { selectedLanguage, setSelectedLanguage }
    : {
      selectedLanguage: languages,
      setSelectedLanguage: any
    }) {

  console.log("Rendered, selected language:", selectedLanguage);
  // const [codeInput, setCodeInput] = useState('let a = 1; let b = 2; a + b;');
  const [promptInput, setPromptInput] = useState('');
  const [pseudocodeInput, setPseudocodeInput] = useState('');
  // const [codeInput, setCodeInput] = useState('a = 1\nb = 2\nprint(a + b)');
  const [codeInput, setCodeInput] = useState('');
  const [runCodeOutput, setRunCodeOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [vmMode, setVmMode] = useState<boolean>(true);

  // const [selectedLanguage, setSelectedLanguage] = useState<languages>('javascript');

  // const { pyodide, isLoadingPyodide } = usePyodideLoader();
  const { runTimeRef, interpreterRef, isLoadingInterpreter } = useInterpreterLoader(selectedLanguage);

  async function promptToPseudocodeSubmit(event) {
    event.preventDefault();
    // setlogMsg("");
    // setWaiting(true);
    // setResult("// Please be patient, this may take a while...");
    // setSelVal("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_REMOTE_API_URL || ''}/api/prompt-to-pseudocode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: promptInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        // setWaiting(false);
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
      // setResult(data.code);
      // setSandboxRunning(true);
      // setWaiting(false);
      // handleGenClick();
      setPseudocodeInput(data.data);
    } catch (error) {
      console.error(error);
      alert(error.message);
      // setWaiting(false);
    }
  }

  async function pseudocodeToCodeSubmit(event) {
    event.preventDefault();
    // setlogMsg("");
    // setWaiting(true);
    // setResult("// Please be patient, this may take a while...");
    // setSelVal("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_REMOTE_API_URL || ''}/api/pseudocode-to-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: pseudocodeInput, selectedLanguage }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        // setWaiting(false);
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
      // setResult(data.code);
      // setSandboxRunning(true);
      // setWaiting(false);
      // handleGenClick();
      setCodeInput(data.data);
    } catch (error) {
      console.error(error);
      alert(error.message);
      // setWaiting(false);
    }
  }

  const handleRunCode = useCallback(async () => {
    setIsRunning(true);

    try {
      if (selectedLanguage === 'python') {
        // const pyodide = interpreter;
        // Capture the console output
        // let capturedOutput = '';

        interpreterRef.current.runPython(codeInput);
        const result = interpreterRef.current.globals.get('global_output');
        setRunCodeOutput(result.toJs().join('\n'));

      } else if (selectedLanguage === 'javascript') {
        // const quickjs: QuickJSContext = interpreterRef.current;

        const result = (interpreterRef.current as QuickJSContext).evalCode(codeInput);

        // console.log('Result:', result);

        // setRunCodeOutput(JSON.stringify(result, null, 0));

        if (result.error) {
          // console.error(interpreterRef.current.dump(result.error));
          const error = (interpreterRef.current.dump(result.error));
          setRunCodeOutput(prev => { return `${prev}\nError: ${error.name} - ${error.message}` });
        } else {
          // console.log(interpreterRef.current.getString(result.value));
          // setRunCodeOutput(prev => { return `${prev}\n${interpreterRef.current.getString(result.value)}` });
          setRunCodeOutput(prev => { return `${prev}\n${JSON.stringify(interpreterRef.current.dump(result.value), null, 0)}` });
        }
      }
    } catch (err: any) {
      setRunCodeOutput(err.toString());
    }

    setIsRunning(false);
  }, [codeInput, selectedLanguage, interpreterRef]);

  const handleReset = useCallback(() => {
    // setCodeInput('');
    // setRunCodeOutput('');
    if (interpreterRef.current) {
      if (selectedLanguage === 'python') {
        // Reinitialize Pyodide to reset the Python environment
        interpreterRef.current.runPython(`
import sys
sys.modules.clear()
`);
        interpreterRef.current.globals.clear();
      } else if (selectedLanguage === 'javascript') {
        // Reinitialize QuickJS to reset the JavaScript environment
        interpreterRef.current.dispose();
        interpreterRef.current = runTimeRef.current.newContext();
      }
    }
  }, [selectedLanguage, interpreterRef, runTimeRef]);

  // whenever runCodeOutput changes, scroll to the bottom of the output container
  useEffect(() => {
    const outputContainer = document.getElementById('run-code-output-container');
    if (outputContainer) {
      outputContainer.scrollTop = outputContainer.scrollHeight;
    }
  }, [runCodeOutput]);

  return (
    <div className="space-y-8 w-full p-4">

      {/* <div className="w-[180px]">
        <select className="w-full rounded p-2 bg-" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div> */}
      <div>
        <h3>Prompt</h3>
        <Textarea
          rows={3}
          cols={50}
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder={`Enter your function prompt here...`}
          className='font-mono text-base border p-2 rounded-md w-full overflow-scroll'
        />
        <div className='w-full flex justify-end gap-2'>
          <Button
            onClick={promptToPseudocodeSubmit}
          // disabled={isRunning || isLoadingInterpreter}
          >
            Generate pseudocode
          </Button>
        </div>
      </div>

      <div>
        <h3>Pseudocode</h3>
        <Textarea
          rows={8}
          cols={50}
          value={pseudocodeInput}
          onChange={(e) => setPseudocodeInput(e.target.value)}
          placeholder={`Enter your function pseudocode here...`}
          className='font-mono text-base border p-2 rounded-md w-full overflow-scroll'
        />

      </div>

      <div className='flex justify-between'>
        <div className='flex gap-4'>
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
          <div className='flex items-center text-sm gap-2'>
            <p className=' shrink-0'>VM Mode</p>
            <Switch
              checked={vmMode}
              onCheckedChange={() => setVmMode(!vmMode)}
            />
          </div>
        </div>
        <div className='w-full flex justify-end gap-2'>
          <Button
            onClick={pseudocodeToCodeSubmit}
          // disabled={isRunning || isLoadingInterpreter}
          >
            Generate {capitalizeFirstLetter(selectedLanguage)} code
          </Button>
        </div>
      </div>

      <div>
        <h3>{capitalizeFirstLetter(selectedLanguage)} Code</h3>
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
        <CodeEditor codeInput={codeInput} setCodeInput={setCodeInput} selectedLanguage={selectedLanguage} />
        <div className='w-full flex justify-end gap-2'>
          <Button
            onClick={handleRunCode}
            disabled={isRunning || isLoadingInterpreter}
          >
            {isLoadingInterpreter ?
              'Loading Pyodide...' : isRunning ? 'Running...' :
                `Run ${capitalizeFirstLetter(selectedLanguage)} Code`}
          </Button>
          <Button onClick={handleReset} disabled={isRunning || isLoadingInterpreter}>
            Reset REPL
          </Button>
        </div>
      </div>

      <div className="output">
        <h3>Output</h3>
        <pre id='run-code-output-container' className='border p-2 rounded-md w-full h-40 overflow-scroll '>{runCodeOutput}</pre>
      </div>
    </div>
  );
};

// export default memo(CodeRunner);

// In the HTML file, you need to load Pyodide before the app starts
// Add this to your public/index.html file:
// <script defer src="https://cdn.jsdelivr.net/pyodide/v0.23.0/full/pyodide.js"></script>

// Usage:
// 1. Paste this file in src/App.js of a new React project.
// 2. Make sure to update the index.html with the Pyodide script, as mentioned above.
// 3. Run `npm start` or `yarn start` to see your app in action.
