# Spare Parts React Analytics SDK

Modular React and TypeScript analytics for Spare Parts. Imports have no side effects; applications explicitly opt into modules such as end-user feedback.

## Install

```sh
npm install @sparepartslabs/react-analytics-sdk
```

## Feedback module

Create an `sp_pub_` key in Workspace Settings with the exact allowed origins, then configure the provider:

```tsx
import { createSpareParts, SparePartsProvider } from "@sparepartslabs/react-analytics-sdk";
import { FeedbackLauncher, FeedbackProvider } from "@sparepartslabs/react-analytics-sdk/feedback";
import "@sparepartslabs/react-analytics-sdk/feedback.css";

const spareParts = createSpareParts();

export function App() {
  return <SparePartsProvider client={spareParts}>
    <FeedbackProvider config={{
      publishableKey: "sp_pub_...",
      theme: "auto",
      classes: { root: "my-feedback" },
      screenshots: { enabled: true },
    }}>
      <YourApplication />
      <FeedbackLauncher>Send feedback</FeedbackLauncher>
    </FeedbackProvider>
  </SparePartsProvider>;
}
```

The module also exports `useFeedback()` and `openFeedback()` for custom launchers.

### Screenshot attachments

Screenshots are disabled by default. Opt in with `screenshots: { enabled: true }`. Users can review previews, remove files, follow upload progress, and retry failures without losing their written feedback.

The platform accepts PNG, JPEG, and WebP images, with at most 5 screenshots and 10 MiB per file. A host can apply stricter limits:

```tsx
<FeedbackProvider config={{
  publishableKey: "sp_pub_...",
  screenshots: { enabled: true, maxCount: 3, maxSizeBytes: 5 * 1024 * 1024 },
}}>
  <App />
</FeedbackProvider>
```

Host limits cannot raise platform limits. Invalid types, empty files, oversized files, duplicates, and excess files are rejected before upload. Feedback submission waits until every remaining screenshot is ready; failed files can be retried or removed.

Uploads use the existing browser-safe `sp_pub_` key to request short-lived managed upload authorization. Image bytes go directly to managed storage. Feedback requests and intake issues contain opaque attachment references only—never raw bytes, base64 images, storage credentials, or unrestricted object URLs. Developers do not configure storage credentials.

Existing configurations without `screenshots`, including text-only submissions, continue unchanged.

## Styling

The default stylesheet is optional. Override namespaced variables from global CSS:

```css
.my-feedback {
  --sp-feedback-font: var(--app-font);
  --sp-feedback-bg: var(--surface);
  --sp-feedback-fg: var(--text);
  --sp-feedback-accent: var(--brand);
  --sp-feedback-accent-fg: var(--on-brand);
  --sp-feedback-border: var(--border);
  --sp-feedback-radius: 6px;
  --sp-feedback-shadow: var(--overlay-shadow);
  --sp-feedback-z-index: 1000;
}
```

Pass `classes` for stable application hooks. `theme` accepts `light`, `dark`, or `auto`. Use `portalTarget` to select an overlay root, or `disablePortal` for an inline surface. The default portal under `document.body` avoids clipping and stacking-context failures. Attachment styles remain namespaced under `.sp-feedback`; the root continues to own the top-level z-index.

Publishable keys are browser-visible credentials restricted to feedback creation and attachment upload; they cannot read workspace data or invoke unrelated Spare Parts APIs.
