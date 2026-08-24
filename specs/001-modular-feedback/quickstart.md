# Quickstart: Validate Modular Feedback

1. Install dependencies and run unit, type, accessibility, and package-boundary tests.
2. Render the sample app with SDK core only; assert no feedback UI/listeners/requests.
3. Register feedback with a local Core `sp_pub_` key and allowed origin.
4. Submit text feedback twice through a simulated uncertain response; expect one receipt/issue.
5. Enable evidence on privacy fixtures and confirm all sensitive regions/values are absent.
6. Run Playwright in light, dark, reduced-motion, keyboard-only, and 320px viewport modes.
