import { useState, useEffect, useRef } from "react";
import { getQuickJS, QuickJSRuntime } from "quickjs-emscripten";
// import { loadPyodide } from "pyodide";  // tried, doesn't work

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import localFont from "next/font/local";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirstLetter(str: string) {
  if (!str) return str; // Check for empty string
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function removeLangStr(str0: string) {
  if (str0.toLowerCase().startsWith("javascript")) {
    str0 = str0.substring(10);
  } else if (str0.toLowerCase().startsWith("js")) {
    str0 = str0.substring(2);
  } else if (str0.toLowerCase().startsWith("python")) {
    str0 = str0.substring(6);
  } else if (str0.toLowerCase().startsWith("py")) {
    str0 = str0.substring(2);
  } else if (str0.toLowerCase().startsWith("pseudocode")) {
    str0 = str0.substring(10);
  } else if (str0.toLowerCase().startsWith("plaintext")) {
    str0 = str0.substring(9);
  }
  return str0.trim();
}

export function handleCommonErrors(res0: string) {
  if (
    res0.startsWith("function ") ||
    res0.startsWith("const ") ||
    res0.startsWith("let ") ||
    res0.startsWith("var ") ||
    res0.startsWith("class ") ||
    res0.startsWith("console.log")
  ) {
    return res0;
  }
  if (res0.startsWith("```")) {
    res0 = res0.split("```")[1];
    res0 = removeLangStr(res0);
  } else {
    const res0Arr = res0.split("```");
    // console.log('res0Arr length: ' + res0Arr.length);

    if (res0Arr.length <= 1) {
      res0Arr[0] = "//" + res0Arr[0];
    } else {
      for (let i = 0; i < res0Arr.length; i++) {
        if (i % 2 === 0) {
          res0Arr[i] = "/* " + res0Arr[i] + "*/ ";
        } else {
          res0Arr[i] = removeLangStr(res0Arr[i]);
        }
      }
    }
    res0 = res0Arr.join("\n");
  }
  return res0;
}

export function commentPrefixForLanguage(selectedLanguage: languages) {
  switch (selectedLanguage) {
    case "python":
      return "#";
    case "javascript":
      return "//";
    default:
      return "#";
  }
}

export const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export type TModelQuality = "low" | "high";

export type languages = "python" | "javascript"; // | 'ruby';

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
  }
}

export const useInterpreterLoader = (language: string) => {
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
        case "python": {
          // runTime = undefined;
          runTimeRef.current = undefined;
          interpreterRef.current = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.0/full/",
          });
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
        case "javascript": {
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
    };
    // }
    loadInterpreter();

    // return () => {
    //   if (interpreterRef.current) {
    //     if (language === 'python') {
    //       interpreterRef
  }, [language]);

  return { runTimeRef, interpreterRef, isLoadingInterpreter };
};
