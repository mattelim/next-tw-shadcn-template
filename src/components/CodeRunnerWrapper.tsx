import { useState } from "react";

import CodeRunner from "./CodeRunner";
import { languages, TModelQuality } from "@/lib/utils";

export default function CodeRunnerWrapper() {
  const [selectedLanguage, setSelectedLanguage] = useState<languages>("python");
  const [promptInput, setPromptInput] = useState("");
  const [pseudocodeInput, setPseudocodeInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [codeExampleInput, setCodeExampleInput] = useState("");
  const [modelQuality, setModelQuality] = useState<TModelQuality>("high");
  const [codeBlockTitle, setCodeBlockTitle] = useState("");

  const [showCodeExample, setShowCodeExample] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [vmMode, setVmMode] = useState(false);

  return (
    <div className="w-full">
      <CodeRunner
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        promptInput={promptInput}
        setPromptInput={setPromptInput}
        pseudocodeInput={pseudocodeInput}
        setPseudocodeInput={setPseudocodeInput}
        codeInput={codeInput}
        setCodeInput={setCodeInput}
        codeExampleInput={codeExampleInput}
        setCodeExampleInput={setCodeExampleInput}
        showCodeExample={showCodeExample}
        setShowCodeExample={setShowCodeExample}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        vmMode={vmMode}
        setVmMode={setVmMode}
        modelQuality={modelQuality}
        setModelQuality={setModelQuality}
        codeBlockTitle={codeBlockTitle}
        setCodeBlockTitle={setCodeBlockTitle}
      />
    </div>
  );
}
