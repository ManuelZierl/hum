# Mobile App

This app is a minimal React Native client that assembles screens and UI
components from the shared `@hum/ui-components` and `@hum/ui-screens`
packages. The entry point is [`App.tsx`](./App.tsx), which wires up a bottom
navigation bar with Chats, Lightning, and Settings pages. Selecting a chat
item opens the full chat view.

## Environment variables

Create an `.env` file (ignored in git) in this directory to inject secrets
needed at runtime. A template is provided as `.env.example`:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Populate the Breez API key:

```
BREEZ_API_KEY=your-key-here
```

When `expo start` runs, the value is exposed to the app via
`Constants.expoConfig.extra.breezApiKey`.
