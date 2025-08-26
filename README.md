# mchat

Placeholder for mchat, an open-source, privacy-first, federated messenger
built with React Native, Expo, and a Rust core.

This repository currently contains the initial project skeleton.

## Quick Links

- [Architecture Decision Records](docs/adr/)
- [Development Setup](docs/dev-setup.md)

## Project Map

| Path | Purpose |
| ---- | ------- |
| apps/mobile | React Native mobile application |
| packages/a11y-utils | Accessibility utilities |
| packages/chat-types | Shared chat domain TypeScript definitions |
| packages/lightning-ui | Lightning Network UI components |
| packages/lightning-utils | Lightning Network helper utilities |
| packages/message-ui | Chat message UI components |
| packages/push-contract | Types for push notification contract |
| packages/ui-tokens | Design tokens for consistent theming |
| native/ln-core | Mock Lightning node core for Expo modules |
| native/rust | Rust workspace for core functionality |
| docs/adr | Architecture decision records |
| docs/a11y-checklist.md | Accessibility checklist |
| docs/dev-setup.md | Development environment setup |
| docs/push-contract.md | Push notification contract details |
| docs/ui-previews | UI component previews |

## Contributing Flow

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. In short: fork the repo, create a branch, commit your changes, and open a pull request for review.

