// import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";

import { Textarea } from "@/components/ui/textarea";
import { languages } from "./CodeRunnerWrapper";

export default function CodeEditor({
  input,
  setInput,
  selectedLanguage,
  editorHeight = "200px",
}: {
  input: string;
  setInput: any;
  selectedLanguage: languages;
  editorHeight?: string;
}) {
  const languageExtension = (lang: languages) => {
    switch (lang) {
      case "python":
        return [python()];
      case "javascript":
        return [javascript({ jsx: true })];
      default:
        return [python()];
    }
  };

  // export default function CodeEditor({ selectedLanguage }:
  //   {
  //     selectedLanguage: string
  //   }) {
  //   const [input, setInput] = useState('let a = 1; let b = 2; a + b;');

  return (
    // <textarea
    //   rows={10}
    //   cols={50}
    //   value={input}
    //   onChange={(e) => setInput(e.target.value)}
    //   placeholder={`Enter your ${selectedLanguage} code here...`}
    //   className='font-mono border p-2 rounded-md w-full overflow-scroll'
    // />
    // <Textarea
    //   rows={10}
    //   cols={50}
    //   value={input}
    //   onChange={(e) => setInput(e.target.value)}
    //   placeholder={`Enter your ${selectedLanguage} code here...`}
    //   className='font-mono text-base border p-2 rounded-md w-full overflow-scroll'
    // />
    <CodeMirror
      value={input}
      height={editorHeight}
      extensions={languageExtension(selectedLanguage)}
      onChange={(value, viewUpdate) => {
        setInput(value);
      }}
      className="border overflow-clip rounded text-base"
    />
  );
}
