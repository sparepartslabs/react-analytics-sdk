# Public Package Contract

Package exports:

- `@sparepartslabs/react-analytics-sdk`: client creation, provider, module interface, lifecycle hooks.
- `@sparepartslabs/react-analytics-sdk/feedback`: feedback module factory, launcher/form components, `useFeedback`, `openFeedback`, and feedback types.

Core initialization does not import capture implementations or activate feedback. Feedback configuration requires `publishableKey` matching `sp_pub_`, endpoint, and optional presentation/evidence settings. Submission follows the versioned Core contract and never accepts GitHub credentials or a repository target.
