import { createContext, useContext, useEffect, useMemo } from "react";
import type { PropsWithChildren } from "react";
import { useSpareParts } from "../core/provider";
import { FeedbackSurface } from "./components/FeedbackSurface";
import { feedback, openFeedback } from "./module";
import type { FeedbackConfig, FeedbackController } from "./types";

const Context = createContext<FeedbackController | null>(null);
export function FeedbackProvider({ config, children }: PropsWithChildren<{ config: FeedbackConfig }>) {
  const client = useSpareParts();
  const module = useMemo(() => feedback(config), [config]);
  useEffect(() => client.register(module), [client, module]);
  return <Context.Provider value={module.controller}>{children}<FeedbackSurface config={config} controller={module.controller} /></Context.Provider>;
}
export function useFeedback() { const value = useContext(Context); if (!value) throw new Error("useFeedback must be used inside FeedbackProvider"); return value; }
export function FeedbackLauncher({ children, className }: PropsWithChildren<{ className?: string }>) { const controller = useFeedback(); return <button className={["sp-feedback-launcher", className].filter(Boolean).join(" ")} type="button" onClick={() => controller.open()}>{children ?? "Feedback"}</button>; }
export { feedback, openFeedback };
export { submitFeedback } from "./submit";
export type * from "./types";
