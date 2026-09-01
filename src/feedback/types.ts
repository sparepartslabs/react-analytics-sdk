export type FeedbackCategory = "bug" | "idea" | "other";
export type FeedbackAttachmentMimeType = "image/png" | "image/jpeg" | "image/webp";
export type FeedbackAttachmentState = "pending" | "uploading" | "uploaded" | "ready" | "failed";
export type FeedbackAttachmentErrorKind = "unsupported_type" | "empty_file" | "too_large" | "too_many" | "duplicate" | "authorization_failed" | "upload_failed" | "finalization_failed";

export const FEEDBACK_ATTACHMENT_MAX_COUNT = 5;
export const FEEDBACK_ATTACHMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const FEEDBACK_ATTACHMENT_MIME_TYPES: readonly FeedbackAttachmentMimeType[] = ["image/png", "image/jpeg", "image/webp"];

export interface FeedbackScreenshotConfig { enabled: boolean; maxCount?: number; maxSizeBytes?: number; }
export interface FeedbackAttachmentDescriptor { id: string; name: string; mimeType: FeedbackAttachmentMimeType; sizeBytes: number; }
export interface FeedbackAttachmentError { kind: FeedbackAttachmentErrorKind; message: string; }
export interface ManagedUploadRequest { url: string; method: string; headers: Record<string, string>; }
export interface FeedbackAttachmentAuthorization { attachmentId: string; upload: ManagedUploadRequest; }
export interface SelectedFeedbackScreenshot {
  localId: string;
  file: File;
  name: string;
  mimeType: FeedbackAttachmentMimeType;
  sizeBytes: number;
  previewUrl: string;
  state: FeedbackAttachmentState;
  progress: number | null;
  attachmentId: string | null;
  error: FeedbackAttachmentError | null;
  attempt: number;
}
export interface FeedbackDraft { title: string; description: string; category: FeedbackCategory; pageUrl?: string; }
export interface FeedbackReceipt { submission_id: string; status: "accepted" | "processing"; issue_url?: string | null; }
export interface FeedbackConfig {
  publishableKey: `sp_pub_${string}`;
  endpoint?: string;
  enabled?: boolean;
  context?: () => Record<string, string | number | boolean>;
  launcherLabel?: string;
  theme?: "light" | "dark" | "auto";
  portalTarget?: HTMLElement | null;
  disablePortal?: boolean;
  classes?: FeedbackClasses;
  screenshots?: FeedbackScreenshotConfig;
}
export interface FeedbackClasses { root?: string; backdrop?: string; panel?: string; form?: string; }
export interface FeedbackController { open(): void; close(): void; subscribe(listener: () => void): () => void; snapshot(): boolean; }
