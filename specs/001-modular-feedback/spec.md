# Feature Specification: Modular In-App Feedback

**Feature Branch**: `feat/modular-feedback`

**Created**: 2026-08-23

**Status**: Draft

**Input**: Create `@sparepartslabs/react-analytics-sdk` as a modular React and TypeScript SDK whose first opt-in module lets an application's end users submit feedback to the application's Spare Parts workspace intake repository through Core.

## User Scenarios & Testing

### User Story 1 - Opt Into Feedback Without Coupling (Priority: P1)

An application developer installs one SDK and explicitly enables the feedback module while leaving future analytics modules disabled.

**Why this priority**: A safe modular boundary is the foundation for every current and future SDK capability.

**Independent Test**: Initialize SDK core without feedback and verify there are no feedback UI, capture hooks, globals, or requests; then enable feedback and verify only that module becomes available.

**Acceptance Scenarios**:

1. **Given** an application imports and initializes SDK core, **When** it does not register feedback, **Then** no feedback controls, DOM observers, console interception, screenshots, or feedback requests are created.
2. **Given** an application registers feedback with valid public workspace configuration, **When** its UI mounts, **Then** the configured launcher and imperative open action are available.
3. **Given** feedback is disabled or unmounted, **When** cleanup completes, **Then** all module-owned UI and listeners are removed without changing other SDK modules.

---

### User Story 2 - Submit Useful In-App Feedback (Priority: P1)

An end user opens a feedback form inside the host application, describes a bug or idea, reviews optional diagnostic evidence, and submits it without needing a GitHub account.

**Why this priority**: This is the first customer-visible outcome of the SDK.

**Independent Test**: Mount the module in a sample application, complete the form with and without optional evidence, and observe an accepted submission response.

**Acceptance Scenarios**:

1. **Given** feedback is enabled, **When** the user opens it, **Then** an accessible form presents summary, description, category, optional submitter fields, and clearly disclosed evidence choices.
2. **Given** a valid report, **When** the user submits once or retries after an uncertain response, **Then** one stable submission is accepted rather than duplicate issues being created.
3. **Given** Core rejects or cannot accept a report, **When** submission fails, **Then** the user's entered content remains available and the UI presents a safe retry state.

---

### User Story 3 - Attach Privacy-Safe Evidence (Priority: P2)

An end user optionally includes an annotated screenshot and bounded browser or console context after reviewing what will be sent.

**Why this priority**: Evidence improves issue quality but must never silently expand collection.

**Independent Test**: Exercise screenshot and context capture on a page containing passwords, payment inputs, explicit mask markers, large logs, and unsupported browser features.

**Acceptance Scenarios**:

1. **Given** sensitive inputs or explicitly masked elements are visible, **When** a screenshot is captured, **Then** those regions are obscured before preview or upload.
2. **Given** diagnostic capture is not selected, **When** feedback is submitted, **Then** console and screenshot content are absent.
3. **Given** evidence exceeds a published bound or a browser cannot capture it, **When** the report is prepared, **Then** evidence is omitted or reduced with an explanation while textual feedback remains submittable.

### Edge Cases

- Feedback is opened before configuration is ready, opened twice, or unmounted during submission.
- The host uses server rendering, strict mode, portals, restrictive content security policy, or multiple SDK providers.
- The browser is offline, blocks screenshots, or returns a late response after the user retries.
- Host styles use extreme stacking contexts or light/dark theme changes while the form is open.
- User-provided text resembles markup, secrets, or very large content.

## Requirements

### Functional Requirements

- **FR-001**: SDK core MUST support explicit module registration and independent module cleanup.
- **FR-002**: SDK core initialization MUST have no feedback-related side effects when the feedback module is absent.
- **FR-003**: Consumers MUST be able to enable feedback declaratively and open it imperatively.
- **FR-004**: The feedback module MUST expose independent package exports so applications can exclude it from bundles when unused.
- **FR-005**: The feedback experience MUST support summary, description, controlled category, optional submitter identity, and optional evidence.
- **FR-006**: The feedback experience MUST meet keyboard, focus, labeling, contrast, reduced-motion, and responsive interaction requirements.
- **FR-007**: The module MUST support light, dark, and host-preference themes without inheriting unsafe host styles.
- **FR-008**: Screenshot capture MUST mask password, payment, and explicitly marked `[data-spareparts-mask]` regions before content can leave the browser.
- **FR-009**: Console and browser diagnostics MUST be opt-in, visible for review, bounded, sanitized, and exclude authorization, cookies, storage, and raw DOM.
- **FR-010**: Every submission MUST carry a client-generated idempotency identifier that is reused for safe retries.
- **FR-011**: The module MUST send only the versioned fields accepted by the Core feedback contract and MUST reject unsafe or malformed configuration locally.
- **FR-012**: Failure states MUST preserve the report and permit retry or cancellation without duplicate submissions.
- **FR-013**: Public exports, entry points, runtime compatibility, and package contents MUST be documented and verifiable before publication.
- **FR-014**: Future analytics modules MUST be addable without requiring feedback configuration or breaking existing module consumers.

### Integration Contract

The module consumes `POST /public/v1/feedback`. It sends a versioned envelope with a browser-safe workspace submission key, idempotency ID, report fields, application origin/path, SDK version, timestamp, bounded context, and attachment references. It receives a stable submission ID and accepted state. The browser never receives GitHub credentials or general workspace authority.

### Key Entities

- **SDK Client**: Shared lifecycle and configuration used by explicitly registered modules.
- **Feedback Module**: Optional UI, capture, validation, submission, and cleanup behavior.
- **Feedback Draft**: User-controlled report fields and reviewable optional evidence before submission.
- **Submission Receipt**: Stable identifier and accepted state returned by Core.

## Success Criteria

### Measurable Outcomes

- **SC-001**: An application developer can install, configure, and display the default feedback launcher in under 10 minutes using published documentation.
- **SC-002**: Initializing SDK core without feedback produces zero feedback DOM nodes, global listeners, capture hooks, or feedback network calls in automated verification.
- **SC-003**: At least 95% of first-time test participants can submit a textual report without assistance in under two minutes.
- **SC-004**: Repeating the same submission up to five times yields exactly one accepted submission.
- **SC-005**: Automated privacy fixtures show zero unmasked password, payment, explicit-mask, cookie, authorization, storage, or raw-DOM values in captured payloads.
- **SC-006**: The feedback experience completes all critical keyboard and screen-reader journeys with no serious accessibility violations.

## Assumptions

- The package is new; there is no prior analytics API compatibility requirement.
- Feedback is the first optional module, and broader analytics collection is intentionally deferred.
- The first release targets supported modern React web applications and browser environments; native applications are out of scope.
- Core owns workspace resolution, abuse controls, attachment persistence, GitHub authentication, issue formatting, and issue creation.
- Customer applications disclose their own end-user privacy terms and choose whether optional evidence is enabled.
