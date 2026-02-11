import { useContext } from "react";
import {
  TutorialContext,
  type TutorialContextValue,
} from "../contexts/TutorialContext";

export const useTutorial = (): TutorialContextValue => {
  const context = useContext(TutorialContext);

  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }

  return context;
};
