# @hum/ui-tokens

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](../../LICENSE)

Design tokens shared across hum clients. Provides color, spacing and typography scales along with a minimal `ThemeProvider`.

## Installation

```sh
npm install @hum/ui-tokens
```

## Usage

Wrap your application with the `ThemeProvider` and access tokens via `useTheme`:

```tsx
import { ThemeProvider, useTheme } from '@hum/ui-tokens';

const Box = () => {
  const { colors, spacing, typography } = useTheme();
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        color: colors.text,
        padding: spacing.md,
        fontFamily: typography.fontFamily,
      }}
    >
      Hello
    </div>
  );
};

export const App = () => (
  <ThemeProvider mode="light">
    <Box />
  </ThemeProvider>
);
```

The `mode` prop toggles between the `light` and `dark` color palettes. Each palette exposes the same keys such as `surface`, `surfaceInverse`, `text`, and `textInverse` to ensure consistent usage across themes.

## Tokens

- **Colors** – `colors.surface`, `colors.surfaceInverse`, `colors.text`, `colors.textInverse`, `colors.primary`, `colors.secondary`
- **Spacing** – `spacing.xs` → `spacing.xl`
- **Typography** – `typography.fontSize`, `typography.fontWeight`, `typography.fontFamily`

## Integration

Import tokens individually if you need static values without React context:

```ts
import { lightColors, spacing, typography } from '@hum/ui-tokens';
```

No circular dependencies exist within this package, keeping the tokens portable and framework agnostic.

## Peer Dependencies

Requires `react` (>=18).
