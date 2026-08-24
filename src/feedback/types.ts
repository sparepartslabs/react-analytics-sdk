export type FeedbackCategory = "bug" | "idea" | "other";
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
}
export interface FeedbackClasses { root?: string; backdrop?: string; panel?: string; form?: string; }
export interface FeedbackController { open(): void; close(): void; subscribe(listener: () => void): () => void; snapshot(): boolean; }
