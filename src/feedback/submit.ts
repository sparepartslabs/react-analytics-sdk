import type { FeedbackAttachmentDescriptor, FeedbackConfig, FeedbackDraft, FeedbackReceipt } from "./types";

export async function submitFeedback(config: FeedbackConfig, draft: FeedbackDraft, idempotencyKey: string, attachments?: readonly FeedbackAttachmentDescriptor[]): Promise<FeedbackReceipt> {
  const attachmentIds = attachments?.map((attachment) => attachment.id) ?? [];
  if (new Set(attachmentIds).size !== attachmentIds.length) throw new Error("Duplicate screenshot attachments cannot be submitted.");
  const body: Record<string, unknown> = { schema_version: 1, idempotency_key: idempotencyKey, report: { title: draft.title, description: draft.description, category: draft.category, page_url: draft.pageUrl ?? window.location.href }, context: config.context?.() ?? {} };
  if (attachmentIds.length > 0) body.attachments = attachmentIds;
  const response = await fetch(`${(config.endpoint ?? "https://api.sparepartslabs.com").replace(/\/$/, "")}/v1/public/feedback`, { method: "POST", headers: { "Content-Type": "application/json", "X-SpareParts-Publishable-Key": config.publishableKey }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(response.status === 429 ? "Too many reports. Try again shortly." : "Feedback could not be sent. Try again.");
  const receipt = await response.json() as Partial<FeedbackReceipt>;
  if (!receipt.submission_id || !["accepted", "processing"].includes(receipt.status ?? "")) throw new Error("The feedback service returned an invalid response.");
  return receipt as FeedbackReceipt;
}
