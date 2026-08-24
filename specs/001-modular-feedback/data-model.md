# Data Model: Modular Feedback

- **SDK Client**: endpoint, application metadata, registered modules, lifecycle state.
- **Feedback Configuration**: `sp_pub_` key, launcher/theme settings, evidence capabilities, callbacks.
- **Feedback Draft**: summary, description, category, optional submitter, evidence consent and previews, stable idempotency ID.
- **Captured Evidence**: sanitized screenshot blob or bounded console/browser records; never cookies, storage, auth, or raw DOM.
- **Submission Receipt**: submission ID, accepted state, retry classification.

Feedback state: closed -> editing -> reviewing -> submitting -> accepted; failures return to review with draft intact. Unmount transitions any state to disposed and releases resources.
