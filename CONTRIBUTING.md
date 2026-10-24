# Contributing

Please open a GitHub Issue describing your Home Assistant version, browser, steps to reproduce, and (where appropriate) a minimal card configuration. Do not share secrets, full Home Assistant configuration files, access tokens or private entity values.

To test JavaScript changes locally:

```sh
node --check dist/sensor-ticker-card.js
node tests/smoke.cjs
```

Open a Pull Request against the `main` branch and describe the change. Please keep the project frontend-only and avoid breaking existing card configurations.
