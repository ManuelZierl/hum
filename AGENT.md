# AGENT.md

## Principles

* **TypeScript-first**: Use TS for all JS/TS code.
* **Modular**: Write small, testable units. Share logic via `packages/`.
* **Style**: Use Prettier + ESLint. Don’t disable rules unless critical.
* **Deps**: Avoid adding packages unless necessary/approved.

## Checks

Run the most specific checks for your changes to save time.

* **TS/JS**:

  ```bash
  npm run lint
  npm run typecheck
  npm test
  ```

  * ESLint + typecheck must pass.
  * Tests should run with \~90% coverage when possible.
* **Rust**: Code must pass `clippy`.

## UI/Text

* Use themes from `theming`.
* Use typography hook for text.
* Make text localizable via `packages/i18n` + add English + German translations.

## Docs

* If changes affect devs, update `docs/` (just-the-docs).
* New `.md` → add header + place correctly + update `index.md` TOC if needed.

## Tests

* Ensure tests run.
* Add meaningful coverage (\~90%).
