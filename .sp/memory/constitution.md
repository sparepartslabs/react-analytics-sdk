# React Analytics SDK Constitution

## Principles

### I. Opt-in Means No Side Effects

Importing or initializing SDK core MUST NOT attach DOM, console, history, network, screenshot, or global event hooks. Each module activates only through explicit consumer configuration and cleans up every resource it owns.

### II. Privacy Before Capture

Sensitive inputs and explicitly masked elements MUST be excluded before evidence leaves the browser. Cookies, authorization data, browser storage, raw DOM, and unbounded logs MUST never be collected. Content capture is visible, optional, and reviewable by the submitting user.

### III. Stable Typed Public Contracts

Every public export MUST be typed, documented, and covered by compatibility tests. Module entry points MUST remain independently importable and tree-shakeable. Breaking changes require a major version.

### IV. Host Application Respect

SDK UI MUST be accessible, responsive, theme-aware, reduced-motion aware, and isolated from host styles. The SDK MUST not break rendering when Core is unavailable and MUST expose deterministic lifecycle and error states.

### V. Verifiable Delivery

Unit, package-boundary, accessibility, browser, and end-to-end submission tests MUST cover the behavior they claim. Builds MUST contain only intentional runtime files and MUST not contain secrets or development configuration.

## Governance

This constitution governs specifications, plans, implementation, and review. Exceptions require an explicit plan justification. Commits use Conventional Commits and contain no tool attribution.

**Version**: 1.0.0 | **Ratified**: 2026-08-23
