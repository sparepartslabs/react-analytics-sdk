import { FEEDBACK_ATTACHMENT_MAX_COUNT, FEEDBACK_ATTACHMENT_MAX_SIZE_BYTES, FEEDBACK_ATTACHMENT_MIME_TYPES } from "./types";
import type { FeedbackAttachmentError, FeedbackAttachmentMimeType, FeedbackScreenshotConfig, SelectedFeedbackScreenshot } from "./types";

export interface EffectiveScreenshotLimits { maxCount: number; maxSizeBytes: number; acceptedTypes: readonly FeedbackAttachmentMimeType[]; }
export interface ScreenshotSelectionResult { accepted: SelectedFeedbackScreenshot[]; rejected: Array<{ file: File; error: FeedbackAttachmentError }>; }

function positiveInteger(value: number | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${field} must be a positive integer.`);
  return value;
}

export function effectiveScreenshotLimits(config?: FeedbackScreenshotConfig, platform?: EffectiveScreenshotLimits): EffectiveScreenshotLimits {
  const count = positiveInteger(config?.maxCount, "screenshots.maxCount");
  const size = positiveInteger(config?.maxSizeBytes, "screenshots.maxSizeBytes");
  return {
    maxCount: Math.min(count ?? platform?.maxCount ?? FEEDBACK_ATTACHMENT_MAX_COUNT, platform?.maxCount ?? FEEDBACK_ATTACHMENT_MAX_COUNT, FEEDBACK_ATTACHMENT_MAX_COUNT),
    maxSizeBytes: Math.min(size ?? platform?.maxSizeBytes ?? FEEDBACK_ATTACHMENT_MAX_SIZE_BYTES, platform?.maxSizeBytes ?? FEEDBACK_ATTACHMENT_MAX_SIZE_BYTES, FEEDBACK_ATTACHMENT_MAX_SIZE_BYTES),
    acceptedTypes: platform?.acceptedTypes ?? FEEDBACK_ATTACHMENT_MIME_TYPES,
  };
}

export function screenshotFingerprint(file: File): string {
  return `${file.name}\u0000${file.type}\u0000${file.size}\u0000${file.lastModified}`;
}

function error(kind: FeedbackAttachmentError["kind"], message: string): FeedbackAttachmentError { return { kind, message }; }

export function selectScreenshots(files: readonly File[], existing: readonly SelectedFeedbackScreenshot[], config?: FeedbackScreenshotConfig, platform?: EffectiveScreenshotLimits): ScreenshotSelectionResult {
  const limits = effectiveScreenshotLimits(config, platform);
  const accepted: SelectedFeedbackScreenshot[] = [];
  const rejected: ScreenshotSelectionResult["rejected"] = [];
  const fingerprints = new Set(existing.map((item) => screenshotFingerprint(item.file)));
  for (const file of files) {
    if (existing.length + accepted.length >= limits.maxCount) { rejected.push({ file, error: error("too_many", `You can attach up to ${limits.maxCount} screenshots.`) }); continue; }
    if (!limits.acceptedTypes.includes(file.type as FeedbackAttachmentMimeType)) { rejected.push({ file, error: error("unsupported_type", `${file.name} must be a PNG, JPEG, or WebP image.`) }); continue; }
    if (file.size === 0) { rejected.push({ file, error: error("empty_file", `${file.name} is empty.`) }); continue; }
    if (file.size > limits.maxSizeBytes) { rejected.push({ file, error: error("too_large", `${file.name} exceeds the ${formatBytes(limits.maxSizeBytes)} limit.`) }); continue; }
    const fingerprint = screenshotFingerprint(file);
    if (fingerprints.has(fingerprint)) { rejected.push({ file, error: error("duplicate", `${file.name} is already attached.`) }); continue; }
    fingerprints.add(fingerprint);
    accepted.push({ localId: crypto.randomUUID(), file, name: file.name, mimeType: file.type as FeedbackAttachmentMimeType, sizeBytes: file.size, previewUrl: URL.createObjectURL(file), state: "pending", progress: null, attachmentId: null, error: null, attempt: 0 });
  }
  return { accepted, rejected };
}

export function releaseScreenshot(item: SelectedFeedbackScreenshot): void { URL.revokeObjectURL(item.previewUrl); }
export function formatBytes(bytes: number): string { return bytes >= 1024 * 1024 ? `${Math.round(bytes / 1024 / 1024)} MiB` : `${Math.ceil(bytes / 1024)} KiB`; }
