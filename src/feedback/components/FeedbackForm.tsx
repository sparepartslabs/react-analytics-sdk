import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { submitFeedback } from "../submit";
import type { FeedbackCategory, FeedbackConfig } from "../types";

export function FeedbackForm({ config, onClose }: { config: FeedbackConfig; onClose(): void }) {
  const idempotencyKey = useRef(crypto.randomUUID());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [state, setState] = useState<"editing" | "sending" | "sent">("editing");
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent) {
    event.preventDefault(); setState("sending"); setError(null);
    try { await submitFeedback(config, { title, description, category }, idempotencyKey.current); setState("sent"); }
    catch (cause) { setState("editing"); setError(cause instanceof Error ? cause.message : "Feedback could not be sent."); }
  }
  if (state === "sent") return <div className="sp-feedback__success" role="status"><h2>Thanks for the feedback</h2><p>Your report was sent to the team.</p><button type="button" onClick={onClose}>Close</button></div>;
  return <form className={["sp-feedback__form", config.classes?.form].filter(Boolean).join(" ")} onSubmit={submit}>
    <div className="sp-feedback__heading"><h2>Send feedback</h2><button aria-label="Close feedback" type="button" onClick={onClose}>×</button></div>
    <label>What happened?<input autoFocus required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
    <label>Details<textarea required maxLength={10000} rows={6} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
    <label>Type<select value={category} onChange={(e) => setCategory(e.target.value as FeedbackCategory)}><option value="bug">Bug</option><option value="idea">Idea</option><option value="other">Other</option></select></label>
    {error && <p className="sp-feedback__error" role="alert">{error}</p>}
    <button className="sp-feedback__submit" disabled={state === "sending"} type="submit">{state === "sending" ? "Sending…" : "Send feedback"}</button>
  </form>;
}
