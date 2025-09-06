# Package Scoping Plan

We plan to publish all packages under the `@hum` scope to prevent naming conflicts and clarify ownership.

## Proposed Package Names

- `@hum/ui-tokens` (current: `ui-tokens`)
- `@hum/message-ui` (current: `message-ui`)
- `@hum/chat-types` (current: `chat-types`)
- `@hum/lightning-utils` (current: `lightning-utils`)
- `@hum/a11y-utils` (current: `a11y-utils`)
- `@hum/push-contract` (current: `push-contract`)

## Migration Plan

1. **Keep existing package names.** Continue publishing and consuming the unscoped packages so no projects break.
2. **Add scoped aliases.** Publish new packages under the `@hum/*` scope that mirror the existing packages while keeping the original names available.
3. **Update imports in one PR.** After the scoped packages are released, change all internal imports and documentation to use the new scoped names in a single pull request.
4. **Deprecate old names.** Once dependents have migrated, mark the unscoped packages as deprecated and eventually stop publishing them.

This phased approach minimizes disruption and provides a clear path to the final scoped package names.
