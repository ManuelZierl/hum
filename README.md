<p align="center">
  <img src="./docs/assets/img/logo-transparent.svg" alt="hum logo" width="200" />
</p>

# hum

Hum is an open-source, privacy-first, federated messenger built with React Native, Expo, and a Rust core. It leverages Matrix for communication and integrates a Lightning wallet for payments.

## Quick Links

- [Documentation](docs/index.md)
- [Architecture Decision Records](docs-legacy/adr/)
- [Development Setup](docs-legacy/dev-setup.md)

## Packages

| Package                                        | Description                                   |
| ---------------------------------------------- | --------------------------------------------- |
| [lightning-client](packages/lightning-client/) | Lightning network client bindings             |
| [lightning-mocks](packages/lightning-mocks/)   | Mock implementations for Lightning components |
| [ui-components](packages/ui-components/)       | Shared React components                       |
| [ui-screens](packages/ui-screens/)             | Example screens built from components         |

## Project Map

| Path                          | Purpose                                       |
| ----------------------------- | --------------------------------------------- |
| apps/mobile                   | React Native mobile application               |
| packages/lightning-client     | Lightning network client bindings             |
| packages/lightning-mocks      | Mock implementations for Lightning components |
| packages/ui-components        | Shared React components                       |
| packages/ui-screens           | Example screens built from components         |
| native/rust                   | Rust workspace for core functionality         |
| docs-legacy/adr               | Architecture decision records                 |
| docs-legacy/a11y-checklist.md | Accessibility checklist                       |
| docs-legacy/dev-setup.md      | Development environment setup                 |
| docs-legacy/push-contract.md  | Push notification contract details            |
| docs-legacy/ui-previews       | UI component previews                         |

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
