import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import {
  getQuickJS,
  // QuickJSWASMModule,
  QuickJSContext,
  QuickJSRuntime
} from 'quickjs-emscripten'

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
  }
}

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import CodeEditor from './CodeEditor';
import { languages } from './CodeRunnerWrapper';

// import './App.css';
// let pyodide: any;
// let opal: any;
// let quickjsWasm: any;
// let interpreter: any;
// let runTime: any;

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
          //         callHostFunction: (msg) => setOutput(interpreter.getString(msg))
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
      selectedLanguage: string,
      setSelectedLanguage: any
    }) {

  console.log("Rendered, selected language:", selectedLanguage);
  const [input, setInput] = useState('let a = 1; let b = 2; a + b;');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  // const [selectedLanguage, setSelectedLanguage] = useState<languages>('javascript');

  // const { pyodide, isLoadingPyodide } = usePyodideLoader();
  const { runTimeRef, interpreterRef, isLoadingInterpreter } = useInterpreterLoader(selectedLanguage);

  const handleRunCode = useCallback(async () => {
    setIsRunning(true);

    try {
      if (selectedLanguage === 'python') {
        // const pyodide = interpreter;
        // Capture the console output
        // let capturedOutput = '';

        interpreterRef.current.runPython(input);
        const result = interpreterRef.current.globals.get('global_output');
        setOutput(result.toJs().join('\n'));

      } else if (selectedLanguage === 'javascript') {
        // const quickjs: QuickJSContext = interpreterRef.current;

        const result = (interpreterRef.current as QuickJSContext).evalCode(input);

        // console.log('Result:', result);

        // setOutput(JSON.stringify(result, null, 0));

        if (result.error) {
          // console.error(interpreterRef.current.dump(result.error));
          const error = (interpreterRef.current.dump(result.error));
          setOutput(prev => { return `${prev}\nError: ${error.name} - ${error.message}` });
        } else {
          // console.log(interpreterRef.current.getString(result.value));
          setOutput(prev => { return `${prev}\n${interpreterRef.current.getString(result.value)}` });
        }
      }
    } catch (err: any) {
      setOutput(err.toString());
    }

    setIsRunning(false);
  }, [input, selectedLanguage, interpreterRef]);

  const handleReset = useCallback(() => {
    // setInput('');
    // setOutput('');
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

  return (
    <div className="space-y-8 w-full p-4">
      <Select
        onValueChange={(value) => {
          setSelectedLanguage(value as languages);
          // setInput(''); 
          // setOutput(''); 
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
      {/* <div className="w-[180px]">
        <select className="w-full rounded p-2 bg-" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div> */}

      <div>
        <h3>Run {selectedLanguage} Code in WASM</h3>
        {/* <textarea
          rows={10}
          cols={50}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Enter your ${selectedLanguage} code here...`}
          className='font-mono border p-2 rounded-md w-full overflow-scroll'
        /> */}
        {/* <Textarea
          rows={10}
          cols={50}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Enter your ${selectedLanguage} code here...`}
          className='font-mono text-base border p-2 rounded-md w-full overflow-scroll'
        /> */}
        <CodeEditor input={input} setInput={setInput} selectedLanguage={selectedLanguage} />
        <div className='w-full flex justify-end gap-2'>
          <Button
            onClick={handleRunCode}
            disabled={isRunning || isLoadingInterpreter}
          >
            {isLoadingInterpreter ?
              'Loading Pyodide...' : isRunning ? 'Running...' :
                `Run ${selectedLanguage} Code`}
          </Button>
          <Button onClick={handleReset} disabled={isRunning || isLoadingInterpreter}>
            Reset REPL
          </Button>
        </div>
      </div>

      <div className="output">
        <h3>Output</h3>
        <pre className='border p-2 rounded-md w-full min-h-36 overflow-scroll'>{output}</pre>
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
