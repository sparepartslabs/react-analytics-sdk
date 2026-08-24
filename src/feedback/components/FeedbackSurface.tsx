import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { FeedbackConfig, FeedbackController } from "../types";
import { FeedbackForm } from "./FeedbackForm";

export function FeedbackSurface({ config, controller }: { config: FeedbackConfig; controller: FeedbackController }) {
  const open = useSyncExternalStore(controller.subscribe, controller.snapshot, () => false);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () => [...(panelRef.current?.querySelectorAll<HTMLElement>("button, input, textarea, select, [href], [tabindex]:not([tabindex=\"-1\"])") ?? [])].filter((element) => !element.hasAttribute("disabled"));
    requestAnimationFrame(() => focusable()[0]?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); controller.close(); return; }
      if (event.key !== "Tab") return;
      const elements = focusable();
      if (!elements.length) return;
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); previousFocus?.focus(); };
  }, [controller, open]);
  if (!open || typeof document === "undefined") return null;
  const surface = <div className={["sp-feedback", config.classes?.root].filter(Boolean).join(" ")} data-sp-theme={config.theme ?? "auto"} data-sp-render={config.disablePortal ? "inline" : "portal"} role="dialog" aria-modal="true" aria-label="Send feedback"><div className={["sp-feedback__backdrop", config.classes?.backdrop].filter(Boolean).join(" ")} onClick={() => controller.close()} /><div ref={panelRef} className={["sp-feedback__panel", config.classes?.panel].filter(Boolean).join(" ")}><FeedbackForm config={config} onClose={() => controller.close()} /></div></div>;
  return config.disablePortal ? surface : createPortal(surface, config.portalTarget ?? document.body);
}
