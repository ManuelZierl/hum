# mchat

## Telemetry

Telemetry is disabled by default. The `packages/telemetry` package exposes a `track(event, props?)` helper that currently performs no operations.

To enable telemetry in the future, set the `ENABLE_TELEMETRY` environment variable to `true`. By default it is set to `false` in `.env.example`.
