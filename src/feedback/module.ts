import type { SparePartsModule } from "../core/module";
import type { FeedbackConfig, FeedbackController } from "./types";

const EVENT = "spareparts:feedback";

export function createFeedbackController(): FeedbackController {
  let open = false;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  return {
    open() { open = true; emit(); },
    close() { open = false; emit(); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    snapshot() { return open; },
  };
}

export function feedback(config: FeedbackConfig): SparePartsModule & { controller: FeedbackController } {
  if (!config.publishableKey.startsWith("sp_pub_")) throw new Error("Feedback requires an sp_pub_ publishable key");
  const controller = createFeedbackController();
  const onOpen = () => controller.open();
  return {
    id: "feedback",
    controller,
    activate() { if (config.enabled !== false && typeof window !== "undefined") window.addEventListener(EVENT, onOpen); },
    dispose() { if (typeof window !== "undefined") window.removeEventListener(EVENT, onOpen); controller.close(); },
  };
}

export function openFeedback(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}
