import type { EffectiveScreenshotLimits } from "./attachments";
import type { FeedbackAttachmentAuthorization, FeedbackAttachmentDescriptor, FeedbackAttachmentMimeType, FeedbackConfig, ManagedUploadRequest } from "./types";
import { FEEDBACK_ATTACHMENT_MAX_COUNT, FEEDBACK_ATTACHMENT_MAX_SIZE_BYTES, FEEDBACK_ATTACHMENT_MIME_TYPES } from "./types";

interface ApiAttachment { id: string; filename: string; content_type: string; byte_size: number; status: string; }
interface AuthorizationResponse extends ApiAttachment { upload: { url: string; method: string; headers?: Record<string, string>; expires_at: string }; }
export interface UploadOptions { signal?: AbortSignal; onProgress?(percent: number): void; onTransferred?(): void; }

function baseUrl(config: FeedbackConfig): string { return (config.endpoint ?? "https://api.sparepartslabs.com").replace(/\/$/, ""); }
function apiHeaders(config: FeedbackConfig): Record<string, string> { return { "Content-Type": "application/json", "X-SpareParts-Publishable-Key": config.publishableKey }; }
function safeMessage(status: number, stage: string): string {
  if (status === 401 || status === 403) return "Screenshot uploads are not authorized for this site. Check the publishable key and allowed origin.";
  if (status === 413) return "This screenshot is larger than the platform allows. Remove it and choose a smaller image.";
  if (status === 429) return "Too many upload attempts. Try again shortly.";
  if (status === 404 || status === 409 || status === 410) return "The screenshot upload expired. Retry it to request a fresh upload.";
  return `Screenshot ${stage} failed. Try again.`;
}
function isRecord(value: unknown): value is Record<string, unknown> { return !!value && typeof value === "object"; }
async function json(response: Response): Promise<unknown> { try { return await response.json(); } catch { throw new Error("The feedback service returned an invalid response."); } }
function isAcceptedType(value: string): value is FeedbackAttachmentMimeType { return FEEDBACK_ATTACHMENT_MIME_TYPES.includes(value as FeedbackAttachmentMimeType); }

export async function fetchAttachmentLimits(config: FeedbackConfig, signal?: AbortSignal): Promise<EffectiveScreenshotLimits> {
  const response = await fetch(`${baseUrl(config)}/public/v1/feedback/attachments/limits`, { headers: apiHeaders(config), signal });
  if (!response.ok) throw new Error(safeMessage(response.status, "limit lookup"));
  const body = await json(response);
  if (!isRecord(body) || !Number.isInteger(body.max_count) || Number(body.max_count) <= 0 || !Number.isInteger(body.max_size_bytes) || Number(body.max_size_bytes) <= 0 || !Array.isArray(body.accepted_types) || !body.accepted_types.every((type) => typeof type === "string" && isAcceptedType(type))) throw new Error("The feedback service returned invalid screenshot limits.");
  return { maxCount: Math.min(Number(body.max_count), FEEDBACK_ATTACHMENT_MAX_COUNT), maxSizeBytes: Math.min(Number(body.max_size_bytes), FEEDBACK_ATTACHMENT_MAX_SIZE_BYTES), acceptedTypes: body.accepted_types as FeedbackAttachmentMimeType[] };
}

export async function authorizeFeedbackScreenshot(config: FeedbackConfig, file: File, signal?: AbortSignal): Promise<FeedbackAttachmentAuthorization> {
  const response = await fetch(`${baseUrl(config)}/public/v1/feedback/attachments`, { method: "POST", headers: apiHeaders(config), signal, body: JSON.stringify({ filename: file.name, content_type: file.type, byte_size: file.size }) });
  if (!response.ok) throw new Error(safeMessage(response.status, "authorization"));
  const body = await json(response);
  if (!isRecord(body) || typeof body.id !== "string" || !isRecord(body.upload) || typeof body.upload.url !== "string" || body.upload.method !== "PUT" || (body.upload.headers !== undefined && !isRecord(body.upload.headers))) throw new Error("The feedback service returned invalid upload authorization.");
  const upload: ManagedUploadRequest = { url: body.upload.url, method: "PUT", headers: (body.upload.headers ?? {}) as Record<string, string> };
  return { attachmentId: body.id, upload };
}

export function transferFeedbackScreenshot(file: File, upload: ManagedUploadRequest, options: UploadOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const abort = () => request.abort();
    request.open(upload.method, upload.url);
    for (const [name, value] of Object.entries(upload.headers)) request.setRequestHeader(name, value);
    request.upload.onprogress = (event) => { if (event.lengthComputable && event.total > 0) options.onProgress?.(Math.min(100, Math.round(event.loaded / event.total * 100))); };
    request.onload = () => { cleanup(); if (request.status >= 200 && request.status < 300) { options.onTransferred?.(); resolve(); } else reject(new Error("Screenshot upload failed. Try again.")); };
    request.onerror = () => { cleanup(); reject(new Error("Screenshot upload failed. Check your connection and try again.")); };
    request.onabort = () => { cleanup(); reject(new DOMException("Screenshot upload was cancelled.", "AbortError")); };
    function cleanup() { options.signal?.removeEventListener("abort", abort); }
    if (options.signal?.aborted) { request.abort(); return; }
    options.signal?.addEventListener("abort", abort, { once: true });
    request.send(file);
  });
}

export async function finalizeFeedbackScreenshot(config: FeedbackConfig, attachmentId: string, file: File, signal?: AbortSignal): Promise<FeedbackAttachmentDescriptor> {
  const response = await fetch(`${baseUrl(config)}/public/v1/feedback/attachments/${encodeURIComponent(attachmentId)}/finalize`, { method: "POST", headers: apiHeaders(config), signal });
  if (!response.ok) throw new Error(safeMessage(response.status, "finalization"));
  const body = await json(response);
  if (!isRecord(body) || body.id !== attachmentId || body.status !== "ready" || body.filename !== file.name || body.content_type !== file.type || body.byte_size !== file.size || !isAcceptedType(String(body.content_type))) throw new Error("The feedback service returned an invalid finalized attachment.");
  return { id: attachmentId, name: file.name, mimeType: file.type as FeedbackAttachmentMimeType, sizeBytes: file.size };
}

export async function uploadFeedbackScreenshot(config: FeedbackConfig, file: File, options: UploadOptions = {}): Promise<FeedbackAttachmentDescriptor> {
  try {
    const authorization = await authorizeFeedbackScreenshot(config, file, options.signal);
    await transferFeedbackScreenshot(file, authorization.upload, options);
    return await finalizeFeedbackScreenshot(config, authorization.attachmentId, file, options.signal);
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    if (cause instanceof Error) throw cause;
    throw new Error("Screenshot upload failed. Try again.");
  }
}
