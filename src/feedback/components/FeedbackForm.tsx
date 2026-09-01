import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { effectiveScreenshotLimits, formatBytes, releaseScreenshot, selectScreenshots } from "../attachments";
import { submitFeedback } from "../submit";
import { fetchAttachmentLimits, uploadFeedbackScreenshot } from "../upload";
import type { EffectiveScreenshotLimits } from "../attachments";
import type { FeedbackAttachmentDescriptor, FeedbackCategory, FeedbackConfig, SelectedFeedbackScreenshot } from "../types";

function stateLabel(item: SelectedFeedbackScreenshot): string {
  if (item.state === "uploading") return item.progress === null ? "Uploading" : `Uploading ${item.progress}%`;
  if (item.state === "uploaded") return "Upload complete; verifying";
  if (item.state === "ready") return "Ready";
  if (item.state === "failed") return item.error?.message ?? "Upload failed";
  return "Ready to upload";
}

export function FeedbackForm({ config, onClose }: { config: FeedbackConfig; onClose(): void }) {
  const idempotencyKey = useRef(crypto.randomUUID());
  const helpId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [state, setState] = useState<"editing" | "sending" | "sent">("editing");
  const [error, setError] = useState<string | null>(null);
  const [selectionErrors, setSelectionErrors] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<SelectedFeedbackScreenshot[]>([]);
  const [platformLimits, setPlatformLimits] = useState<EffectiveScreenshotLimits | undefined>();
  const screenshotsRef = useRef(screenshots);
  const aborts = useRef(new Map<string, AbortController>());
  const mounted = useRef(true);
  screenshotsRef.current = screenshots;

  useEffect(() => () => {
    mounted.current = false;
    aborts.current.forEach((controller) => controller.abort());
    screenshotsRef.current.forEach(releaseScreenshot);
  }, []);

  const screenshotsEnabled = config.screenshots?.enabled === true;
  useEffect(() => {
    if (!screenshotsEnabled) { setPlatformLimits(undefined); return; }
    const controller = new AbortController();
    void fetchAttachmentLimits(config, controller.signal).then((next) => { if (mounted.current) setPlatformLimits(next); }).catch((cause) => { if (mounted.current && !(cause instanceof DOMException && cause.name === "AbortError")) setSelectionErrors([cause instanceof Error ? cause.message : "Screenshot limits could not be loaded."]); });
    return () => controller.abort();
  }, [config.endpoint, config.publishableKey, screenshotsEnabled]);
  const limits = screenshotsEnabled ? effectiveScreenshotLimits(config.screenshots, platformLimits) : null;

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (!screenshotsEnabled || files.length === 0) return;
    const result = selectScreenshots(files, screenshotsRef.current, config.screenshots, platformLimits);
    setScreenshots((current) => [...current, ...result.accepted]);
    setSelectionErrors(result.rejected.map(({ error: rejected }) => rejected.message));
  }

  function removeScreenshot(localId: string) {
    aborts.current.get(localId)?.abort();
    aborts.current.delete(localId);
    setScreenshots((current) => {
      const removed = current.find((item) => item.localId === localId);
      if (removed) releaseScreenshot(removed);
      return current.filter((item) => item.localId !== localId);
    });
  }

  function updateScreenshot(localId: string, attempt: number, patch: Partial<SelectedFeedbackScreenshot>) {
    if (!mounted.current) return;
    setScreenshots((current) => current.map((item) => item.localId === localId && item.attempt === attempt ? { ...item, ...patch } : item));
  }

  async function uploadOne(item: SelectedFeedbackScreenshot): Promise<FeedbackAttachmentDescriptor> {
    if (item.state === "ready" && item.attachmentId) return { id: item.attachmentId, name: item.name, mimeType: item.mimeType, sizeBytes: item.sizeBytes };
    const attempt = item.attempt + 1;
    const controller = new AbortController();
    aborts.current.get(item.localId)?.abort();
    aborts.current.set(item.localId, controller);
    setScreenshots((current) => current.map((entry) => entry.localId === item.localId ? { ...entry, attempt, state: "uploading", progress: null, error: null, attachmentId: null } : entry));
    try {
      const descriptor = await uploadFeedbackScreenshot(config, item.file, {
        signal: controller.signal,
        onProgress(progress) { updateScreenshot(item.localId, attempt, { state: "uploading", progress }); },
        onTransferred() { updateScreenshot(item.localId, attempt, { state: "uploaded", progress: 100 }); },
      });
      updateScreenshot(item.localId, attempt, { state: "ready", progress: 100, attachmentId: descriptor.id, error: null });
      return descriptor;
    } catch (cause) {
      if (!controller.signal.aborted) {
        const message = cause instanceof Error ? cause.message : "Screenshot upload failed. Try again.";
        updateScreenshot(item.localId, attempt, { state: "failed", progress: null, error: { kind: "upload_failed", message } });
      }
      throw cause;
    } finally {
      if (aborts.current.get(item.localId) === controller) aborts.current.delete(item.localId);
    }
  }

  async function retryScreenshot(item: SelectedFeedbackScreenshot) {
    setError(null);
    try { await uploadOne(item); } catch { /* Per-file error is already retained. */ }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setState("sending"); setError(null);
    try {
      const current = screenshotsRef.current;
      const attachments = screenshotsEnabled ? await Promise.all(current.map(uploadOne)) : undefined;
      if (screenshotsEnabled && screenshotsRef.current.some((item) => !current.some((started) => started.localId === item.localId))) throw new Error("Attachments changed during upload. Review them and try again.");
      await submitFeedback(config, { title, description, category }, idempotencyKey.current, attachments);
      if (!mounted.current) return;
      setState("sent");
      screenshotsRef.current.forEach(releaseScreenshot);
      screenshotsRef.current = [];
      setScreenshots([]);
    } catch (cause) {
      if (!mounted.current) return;
      setState("editing");
      if (!(cause instanceof DOMException && cause.name === "AbortError")) setError(cause instanceof Error ? cause.message : "Feedback could not be sent.");
    }
  }

  if (state === "sent") return <div className="sp-feedback__success" role="status"><h2>Thanks for the feedback</h2><p>Your report was sent to the team.</p><button type="button" onClick={onClose}>Close</button></div>;
  return <form className={["sp-feedback__form", config.classes?.form].filter(Boolean).join(" ")} onSubmit={submit}>
    <div className="sp-feedback__heading"><h2>Send feedback</h2><button aria-label="Close feedback" type="button" onClick={onClose}>×</button></div>
    <label>What happened?<input autoFocus required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
    <label>Details<textarea required maxLength={10000} rows={6} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
    <label>Type<select value={category} onChange={(e) => setCategory(e.target.value as FeedbackCategory)}><option value="bug">Bug</option><option value="idea">Idea</option><option value="other">Other</option></select></label>
    {screenshotsEnabled && limits && <section className="sp-feedback__attachments" aria-labelledby={`${helpId}-label`}>
      <label id={`${helpId}-label`} htmlFor={`${helpId}-input`}>Screenshots</label>
      <p className="sp-feedback__attachment-help" id={helpId}>PNG, JPEG, or WebP. Up to {limits.maxCount} files, {formatBytes(limits.maxSizeBytes)} each.</p>
      <input id={`${helpId}-input`} aria-describedby={helpId} type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={chooseFiles} />
      {selectionErrors.length > 0 && <ul className="sp-feedback__attachment-errors" role="alert">{selectionErrors.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}</ul>}
      {screenshots.length > 0 && <ul className="sp-feedback__attachment-list" aria-label="Selected screenshots">{screenshots.map((item) => <li className="sp-feedback__attachment" key={item.localId}>
        <img className="sp-feedback__attachment-preview" src={item.previewUrl} alt={`Preview of ${item.name}`} />
        <div><div className="sp-feedback__attachment-name">{item.name}</div><p className="sp-feedback__attachment-meta">{formatBytes(item.sizeBytes)}</p>
          {item.state === "uploading" && item.progress !== null && <progress aria-label={`Upload progress for ${item.name}`} max={100} value={item.progress} />}
          <p className={item.state === "failed" ? "sp-feedback__error" : "sp-feedback__attachment-status"} role={item.state === "failed" ? "alert" : "status"}>{stateLabel(item)}</p>
          <div className="sp-feedback__attachment-actions">{item.state === "failed" && <button className="sp-feedback__attachment-action" type="button" onClick={() => void retryScreenshot(item)}>Retry {item.name}</button>}<button className="sp-feedback__attachment-action sp-feedback__attachment-action--remove" type="button" onClick={() => removeScreenshot(item.localId)}>Remove {item.name}</button></div>
        </div>
      </li>)}</ul>}
    </section>}
    {error && <p className="sp-feedback__error" role="alert">{error}</p>}
    <button className="sp-feedback__submit" disabled={state === "sending"} type="submit">{state === "sending" ? "Uploading and sending…" : "Send feedback"}</button>
  </form>;
}
