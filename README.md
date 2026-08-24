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
    <FeedbackProvider config={{ publishableKey: "sp_pub_...", theme: "auto", classes: { root: "my-feedback" } }}>
      <YourApplication />
      <FeedbackLauncher>Send feedback</FeedbackLauncher>
    </FeedbackProvider>
  </SparePartsProvider>;
}
```

The module also exports `useFeedback()` and `openFeedback()` for custom launchers.

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

Pass `classes` for stable application hooks. `theme` accepts `light`, `dark`, or `auto`. Use `portalTarget` to select an overlay root, or `disablePortal` for an inline surface. The default portal under `document.body` avoids clipping and stacking-context failures.

Publishable keys are browser-visible credentials restricted to `feedback:create`; they cannot read workspace data or invoke other Spare Parts APIs.
