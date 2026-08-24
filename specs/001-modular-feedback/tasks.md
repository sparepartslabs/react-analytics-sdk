# Tasks: Modular In-App Feedback

## Phase 1: Setup

- [ ] T001 Initialize package, TypeScript, React peers, build exports, and scripts in package.json and tsconfig.json
- [ ] T002 [P] Configure Vitest, Testing Library, axe, and Playwright in vitest.config.ts and playwright.config.ts
- [ ] T003 [P] Add CI for typecheck, tests, package contents, browser tests, and secret scan in .github/workflows/test.yml

## Phase 2: Foundational

- [ ] T004 Define module lifecycle and public types in src/core/module.ts
- [ ] T005 Implement SDK client registration, activation, disposal, and error isolation in src/core/client.ts
- [ ] T006 [P] Implement React provider and hooks in src/core/provider.tsx
- [ ] T007 Add root exports with no feedback imports in src/index.ts and package.json
- [ ] T008 Test zero-side-effect imports, strict-mode lifecycle, SSR import, and cleanup in tests/core.test.tsx

## Phase 3: User Story 1 - Opt Into Feedback

- [ ] T009 [P] [US1] Define feedback configuration and state types in src/feedback/types.ts
- [ ] T010 [US1] Implement lazy feedback module factory and controller in src/feedback/module.ts
- [ ] T011 [P] [US1] Implement isolated portal surface and theme boundary in src/feedback/components/FeedbackSurface.tsx
- [ ] T012 [US1] Add launcher, provider hook, and imperative open API in src/feedback/index.ts
- [ ] T013 [US1] Test absent, enabled, disabled, multiple-provider, and cleanup behavior in tests/feedback-module.test.tsx

## Phase 4: User Story 2 - Submit Feedback

- [ ] T014 [P] [US2] Implement accessible report fields, validation, review, focus, and retry UI in src/feedback/components/FeedbackForm.tsx
- [ ] T015 [P] [US2] Implement bounded versioned envelope and receipt parser in src/feedback/submit.ts
- [ ] T016 [US2] Preserve one idempotency ID and draft across uncertain retries in src/feedback/module.ts
- [ ] T017 [US2] Test keyboard, screen-reader labels, failures, duplicate retry, and malformed responses in tests/feedback-submit.test.tsx

## Phase 5: User Story 3 - Privacy-Safe Evidence

- [ ] T018 [P] [US3] Implement explicit mask discovery and sensitive-input masking in src/feedback/capture/mask.ts
- [ ] T019 [P] [US3] Implement lazy screenshot capture and annotation primitives in src/feedback/capture/screenshot.ts
- [ ] T020 [P] [US3] Implement opt-in bounded console/browser context with cleanup in src/feedback/capture/context.ts
- [ ] T021 [US3] Add evidence preview, consent, removal, and degraded-browser behavior in src/feedback/components/EvidenceReview.tsx
- [ ] T022 [US3] Test password, payment, marker, secret, oversize, unsupported, and cleanup fixtures in tests/privacy.test.tsx

## Phase 6: Polish

- [ ] T023 Add sample application and Core integration flow in examples/react-feedback/App.tsx
- [ ] T024 Add public API, privacy, CSP, SSR, and setup documentation in README.md
- [ ] T025 Run package tarball inspection and all quickstart browser scenarios in specs/001-modular-feedback/quickstart.md

## Dependencies

Foundation blocks all stories. US1 enables US2; US3 can develop after types and joins US2 at evidence review. T002/T003, T009/T011, and T018-T020 are parallel opportunities.

## MVP

Phases 1-4 provide a modular SDK and text-only accessible feedback submission. Evidence follows independently.
