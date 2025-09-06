<p align="center">
  <img src="./imgs/logo-transparent.svg" alt="hum logo" width="200" />
</p>

# hum

Hum is an open-source, privacy-first, federated messenger built with React Native, Expo, and a Rust core. It leverages Matrix for communication and integrates a Lightning wallet for payments.

## Quick Links

- [Documentation](docs/index.md)
- [Architecture Decision Records](docs-legacy/adr/)
- [Development Setup](docs-legacy/dev-setup.md)

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

| Path                          | Purpose                                   |
| ----------------------------- | ----------------------------------------- |
| apps/mobile                   | React Native mobile application           |
| packages/a11y-utils           | Accessibility utilities                   |
| packages/chat-types           | Shared chat domain TypeScript definitions |
| packages/lightning-ui         | Lightning Network UI components           |
| packages/lightning-utils      | Lightning Network helper utilities        |
| packages/message-ui           | Chat message UI components                |
| packages/push-contract        | Types for push notification contract      |
| packages/ui-tokens            | Design tokens for consistent theming      |
| native/rust                   | Rust workspace for core functionality     |
| docs-legacy/adr               | Architecture decision records             |
| docs-legacy/a11y-checklist.md | Accessibility checklist                   |
| docs-legacy/dev-setup.md      | Development environment setup             |
| docs-legacy/push-contract.md  | Push notification contract details        |
| docs-legacy/ui-previews       | UI component previews                     |

## Storybook and Mobile

### Storybook

- Storybook packages are pinned to **8.6.14** to avoid internal import errors.
- Vite aliases map `react-native` to `react-native-web` and `@hum/*` packages to their `src` directories so Storybook can bundle TypeScript directly.
- Add new stories using [Component Story Format](https://storybook.js.org/docs/react/writing-stories/introduction) under `apps/storybook/storybook/stories`. Rename any legacy `storiesOf` files to `*.stories.tsx.skip`.
- `react-native-web` logs peer dependency warnings for React 18; these are safe to ignore when using React 19.
- TypeScript prop extraction is disabled (`reactDocgen: false`) to avoid `jsdoc-type-pratt-parser` runtime errors with React 19.

Run Storybook with `npm --prefix apps/storybook start` or `npm run sb:start`.

### Mobile

Start the Expo app with `npm --prefix apps/mobile start`.

## Contributing Flow

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. In short: fork the repo, create a branch, commit your changes, and open a pull request for review.
