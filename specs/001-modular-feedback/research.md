# Research: Modular In-App Feedback

- **Decision**: Explicit module registration and `./feedback` subpath export. **Rationale**: zero core side effects and bundle exclusion. **Alternatives**: always-on provider and runtime feature flags retain unwanted code/behavior.
- **Decision**: Portal-based isolated surface with scoped reset rather than Shadow DOM in v1. **Rationale**: React accessibility/focus tooling remains straightforward while host CSS is controlled. **Alternative**: Shadow DOM complicates portals and consumer theming.
- **Decision**: Screenshot capture loads lazily only after user action and masks before preview. **Rationale**: privacy and bundle cost. **Alternative**: eager capture is unacceptable.
- **Decision**: Console context uses an opt-in bounded ring buffer installed only when enabled. **Rationale**: deterministic cleanup and review. **Alternative**: reading historical console output is not portable.
