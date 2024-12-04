import { useState } from "react";
import CodeRunner from "./CodeRunner";

export type languages = "python" | "javascript"; // | 'ruby';

export default function CodeRunnerWrapper() {
  const [selectedLanguage, setSelectedLanguage] = useState<languages>("python");

  return (
    <div className="w-full">
      <CodeRunner
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />
    </div>
  );
}
