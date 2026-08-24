# Implementation Plan: Modular In-App Feedback

**Branch**: `feat/modular-feedback` | **Date**: 2026-08-23 | **Spec**: [spec.md](spec.md)

## Summary

Build a small module lifecycle with independent entry points, then deliver feedback as the first explicit module: accessible React UI, privacy-first evidence capture, idempotent submission, and no feedback side effects from SDK core.

## Technical Context

**Language**: TypeScript 5.x  
**Runtime**: React 18/19 peer support, modern browsers, SSR-safe imports  
**Build**: ESM-first package with declarations and explicit `./feedback` export  
**Testing**: Vitest, Testing Library, axe, Playwright, package-content and side-effect tests  
**Constraints**: zero feedback side effects from core; tree-shakeable module; no secrets/storage/DOM dumps; accessible isolated UI; bounded payloads

## Constitution Check

The design makes activation explicit, masks before capture, exposes typed stable contracts, isolates host UI, and includes unit/browser/package/E2E verification. No exceptions.

## Structure

```text
src/core/{client,module,provider}.ts(x)
src/feedback/{index,module,components,capture,submit,types}.ts(x)
src/index.ts
tests/{core,feedback,privacy,package}.test.ts(x)
e2e/feedback.spec.ts
```

## Design

Core owns lifecycle only. `createFeedbackModule(config)` returns a module registered with the shared client/provider. React bindings render through an isolated portal only while enabled. Capture adapters are lazy and explicit. Submission uses `X-SpareParts-Publishable-Key`, exact browser Origin, a versioned envelope, and a stable client idempotency ID.

## Post-Design Constitution Check

Entry-point separation, cleanup ownership, payload allowlisting, and privacy fixtures satisfy every principle.
