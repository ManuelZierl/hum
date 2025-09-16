---
layout: default
title: Mobile CI/CD (staging)
parent: Development
nav_order: 7
---

# Mobile CI/CD (staging)

Hum ships preview builds to testers whenever the `staging` branch changes. The
existing [CI workflow](../.github/workflows/ci.yml) powers the automation via
staging-specific jobs:

- **Pull requests targeting `staging`** run the standard `node`, `rust`,
  `markdown`, and `storybook-e2e` jobs so contributors see lint, test, and type
  status before merging.
- **Pushes to `staging`** reuse those checks and then execute the
  `Build Android preview (staging)` and `Build iOS preview (staging)` jobs. These
  jobs build signed artifacts with EAS, upload the files to the workflow run, and
  submit the latest builds to the Google Play _Internal testing_ track and to
  TestFlight.

## Required secrets

Add the following repository or organization secrets before enabling staging
releases:

| Secret | Purpose |
| --- | --- |
| `EXPO_TOKEN` | EAS authentication token used for both build and submit steps. |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | JSON service account for Google Play submission. The workflow writes this to `apps/mobile/credentials/google-service-account.json` before running `eas submit`. |
| `EXPO_ASC_APP_ID` | Numeric App Store Connect App ID (for example `1234567890`). Injected into `apps/mobile/eas.json` so `eas submit` can run non-interactively. |
| `EXPO_APPLE_APP_STORE_CONNECT_API_KEY` | JSON representation of the App Store Connect API key with distribution access. |
| `EXPO_APPLE_APP_SPECIFIC_PASSWORD` | App-specific password for the Apple ID (used when API key flows need additional authentication). |
| `EXPO_APPLE_ID` | Apple ID email used for TestFlight distribution. |
| `EXPO_APPLE_TEAM_ID` | Ten-character Apple Developer Team ID. |
| `TESTFLIGHT_GROUPS` (optional) | Comma-separated list of TestFlight group names to receive each build. Omit to use the default App Store Connect behaviour. |

> **Tip:** Store the JSON-based secrets exactly as returned by Apple or Google.
> Multiline values are supported. The workflow writes them to disk as needed
> without additional escaping.

## Managing testers

### Google Play (Internal testing track)

1. Open the [Google Play Console](https://play.google.com/console) and select
   the Hum application.
2. Navigate to **Testing → Internal testing** and ensure the "Internal testing"
   track is configured.
3. Add or remove testers under **Testers → Email lists** or by uploading CSV
   lists. Testers receive an invitation email the first time they are added.
4. Each push to `staging` triggers the Android job, which submits the newest
   build (`track: internal`). Google Play performs its quick review before the
   release becomes downloadable for testers.

### TestFlight

1. Visit [App Store Connect](https://appstoreconnect.apple.com/) and select the
   Hum app.
2. Create TestFlight groups as needed under **TestFlight → Groups**. Note the
   group names.
3. Add testers (internal or external) to each group. Internal testers can be
   added immediately; external testers require App Review approval.
4. Set the `TESTFLIGHT_GROUPS` secret with a comma-separated list of the groups
   that should receive every staged build (for example `QA Team, Beta Friends`).
   The workflow maps those names to the `-g`/`--groups` flags on `eas submit`.
5. Each push to `staging` uploads the IPA to TestFlight using the App Store
   Connect API key and enrolls the specified groups. Testers receive the usual
   TestFlight email when the build is ready.

## Downloading build artifacts

Every remote build produces a signed artifact that is also attached to the
GitHub Actions run:

1. Open the desired run under **Actions → CI**.
2. Scroll to the bottom of the run summary and download the `android-staging`
   (`.apk`/`.aab`) or `ios-staging` (`.ipa`) artifacts.
3. Artifacts are named directly from the Expo build URL, making it easy to
   identify the version uploaded to the app stores.

## Local preview builds

The `apps/mobile/eas.json` file contains the shared `preview` profile used by
both the workflow and local developers. To run the same build locally:

```bash
cd apps/mobile
npx eas build --profile preview --platform android
npx eas build --profile preview --platform ios
```

The commands respect the same environment variables as the CI jobs, so you can
point at staging services or override credentials when testing locally.
