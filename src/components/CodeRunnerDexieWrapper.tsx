import React, { useEffect, useState } from "react";
import CodeRunner from "./CodeRunner";
import { TCodeBlock } from "@/lib/db";
import { languages, TModelQuality } from "@/lib/utils";

export default function CodeRunnerDexieWrapper({
  codeBlock,
  setUpdateCount,
}: {
  codeBlock: TCodeBlock;
  setUpdateCount: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { title, prompt, pseudocode, codeInstances, metaData } = codeBlock;
  const { programmingLanguage, code, example } = codeInstances[0];
  const { modelUsed } = metaData;

  const [selectedLanguage, setSelectedLanguage] = useState<languages>(
    programmingLanguage as languages,
  );
  const [promptInput, setPromptInput] = useState(prompt);
  const [pseudocodeInput, setPseudocodeInput] = useState(pseudocode);
  const [codeInput, setCodeInput] = useState(code);
  const [codeExampleInput, setCodeExampleInput] = useState(example);
  const [modelQuality, setModelQuality] = useState<TModelQuality>(
    modelUsed as TModelQuality,
  );
  const [codeBlockTitle, setCodeBlockTitle] = useState(title);

  const [showCodeExample, setShowCodeExample] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [vmMode, setVmMode] = useState(false);

  const [isValuesChanged, setIsValuesChanged] = useState(false);

  useEffect(() => {
    if (
      selectedLanguage !== programmingLanguage ||
      promptInput !== prompt ||
      pseudocodeInput !== pseudocode ||
      codeInput !== code ||
      codeExampleInput !== example ||
      modelQuality !== modelUsed ||
      codeBlockTitle !== title
    ) {
      console.log("values changed!");
      setIsValuesChanged(true);
    } else {
      setIsValuesChanged(false);
    }
  }, [
    selectedLanguage,
    promptInput,
    pseudocodeInput,
    codeInput,
    codeExampleInput,
    modelQuality,
    codeBlockTitle,
    programmingLanguage,
    prompt,
    pseudocode,
    code,
    example,
    modelUsed,
    title,
  ]);

  console.log("Code block:", codeBlock);
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
        codeBlockId={codeBlock.id}
        isValuesChanged={isValuesChanged}
        setUpdateCount={setUpdateCount}
      />
    </div>
  );
}
