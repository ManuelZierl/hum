# hum

Placeholder for hum, an open-source, privacy-first, federated messenger
built with React Native, Expo, and a Rust core.

This repository currently contains the initial project skeleton.

## Quick Links

- [Architecture Decision Records](docs/adr/)
- [Development Setup](docs/dev-setup.md)

## Packages

| Package                                                    | Description                               |
| ---------------------------------------------------------- | ----------------------------------------- |
| [@hum/a11y-utils](packages/a11y-utils/README.md)           | Accessibility utilities                   |
| [@hum/chat-types](packages/chat-types/README.md)           | Shared chat domain TypeScript definitions |
| [@hum/lightning-ui](packages/lightning-ui/README.md)       | Lightning Network UI components           |
| [@hum/lightning-utils](packages/lightning-utils/README.md) | Lightning Network helper utilities        |
| [@hum/message-ui](packages/message-ui/README.md)           | Chat message UI components                |
| [@hum/push-contract](packages/push-contract/README.md)     | Types for push notification contract      |
| [@hum/ui-tokens](packages/ui-tokens/README.md)             | Design tokens for consistent theming      |

## Project Map

| Path                     | Purpose                                   |
| ------------------------ | ----------------------------------------- |
| apps/mobile              | React Native mobile application           |
| packages/a11y-utils      | Accessibility utilities                   |
| packages/chat-types      | Shared chat domain TypeScript definitions |
| packages/lightning-ui    | Lightning Network UI components           |
| packages/lightning-utils | Lightning Network helper utilities        |
| packages/message-ui      | Chat message UI components                |
| packages/push-contract   | Types for push notification contract      |
| packages/ui-tokens       | Design tokens for consistent theming      |
| native/ln-core           | Mock Lightning node core for Expo modules |
| native/rust              | Rust workspace for core functionality     |
| docs/adr                 | Architecture decision records             |
| docs/a11y-checklist.md   | Accessibility checklist                   |
| docs/dev-setup.md        | Development environment setup             |
| docs/push-contract.md    | Push notification contract details        |
| docs/ui-previews         | UI component previews                     |

## Storybook and Mobile

### Storybook

- Storybook packages are pinned to **8.6.14** to avoid internal import errors.
- Vite aliases map `react-native` to `react-native-web` and `@hum/*` packages to their `src` directories so Storybook can bundle TypeScript directly.
- Add new stories using [Component Story Format](https://storybook.js.org/docs/react/writing-stories/introduction) under `apps/storybook/storybook/stories`. Rename any legacy `storiesOf` files to `*.stories.tsx.skip`.
- `react-native-web` logs peer dependency warnings for React 18; these are safe to ignore when using React 19.
- TypeScript prop extraction is disabled (`reactDocgen: false`) to avoid `jsdoc-type-pratt-parser` runtime errors with React 19.

Run Storybook with `pnpm -F storybook start`.

### Mobile

Start the Expo app with `pnpm -F mobile start -- --clear`.

## Contributing Flow

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. In short: fork the repo, create a branch, commit your changes, and open a pull request for review.
