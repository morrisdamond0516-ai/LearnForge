import { createContext, useContext } from "react";

export type LabModuleFlowContextValue = {
  inFlow: boolean;
  practiceCompleteLabel: string;
  onPracticeComplete: () => void;
};

export const LabModuleFlowContext =
  createContext<LabModuleFlowContextValue | null>(null);

export function useLabModuleFlow() {
  return useContext(LabModuleFlowContext);
}
