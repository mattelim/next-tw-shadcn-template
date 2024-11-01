// import { useState } from "react";

import { Textarea } from "@/components/ui/textarea";

export default function CodeEditor({ input, setInput, selectedLanguage }:
  {
    input: string,
    setInput: any,
    selectedLanguage: string
  }) {

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
    <Textarea
      rows={10}
      cols={50}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder={`Enter your ${selectedLanguage} code here...`}
      className='font-mono text-base border p-2 rounded-md w-full overflow-scroll'
    />
  );
}