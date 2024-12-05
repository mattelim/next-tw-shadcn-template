import React, { useContext } from "react";

import { useInterpreterLoader } from "@/lib/utils";

interface PyodideContext {
  runTimeRef: React.MutableRefObject<any> | undefined;
  interpreterRef: React.MutableRefObject<any> | undefined;
  isLoadingInterpreter: boolean;
}

const FlowPyodideContext = React.createContext<PyodideContext>({
  runTimeRef: undefined,
  interpreterRef: undefined,
  isLoadingInterpreter: false,
});

export const useFlowPyodide = () => useContext(FlowPyodideContext);

export const FlowPyodideProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // currently hardcoded to python
  const { runTimeRef, interpreterRef, isLoadingInterpreter } =
    useInterpreterLoader("python");

  return (
    <FlowPyodideContext.Provider
      value={{ runTimeRef, interpreterRef, isLoadingInterpreter }}
    >
      {children}
    </FlowPyodideContext.Provider>
  );
};
