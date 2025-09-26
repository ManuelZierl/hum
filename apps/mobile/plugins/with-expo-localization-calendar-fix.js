/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports */
/* global require, module, console */

const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs/promises');

/**
 * Adds an @unknown default branch to expo-localization's calendar switch so
 * Swift 6 treats it as exhaustive.
 */
async function patchLocalizationModule(projectRoot) {
  let filePath;
  try {
    filePath = require.resolve(
      'expo-localization/ios/LocalizationModule.swift',
      {
        paths: [projectRoot],
      },
    );
  } catch (resolveError) {
    console.warn(
      '[with-expo-localization-calendar-fix] Unable to resolve expo-localization from',
      projectRoot,
      resolveError,
    );
    return;
  }

  try {
    const original = await fs.readFile(filePath, 'utf8');
    if (original.includes('@unknown default')) {
      return;
    }

    const needle = '    case .iso8601:\n      return "iso8601"';
    if (!original.includes(needle)) {
      console.warn(
        '[with-expo-localization-calendar-fix] could not find expected switch case in LocalizationModule.swift. Skipping patch.',
      );
      return;
    }

    const patched = original.replace(
      `${needle}\n    }`,
      `${needle}\n    @unknown default:\n      return "iso8601"\n    }`,
    );

    if (patched === original) {
      console.warn(
        '[with-expo-localization-calendar-fix] replacement did not modify LocalizationModule.swift. Ensure the file structure matches expectations.',
      );
      return;
    }

    await fs.writeFile(filePath, patched, 'utf8');
    console.log(
      '[with-expo-localization-calendar-fix] Patched expo-localization to handle future calendar identifiers.',
    );
  } catch (error) {
    console.warn(
      '[with-expo-localization-calendar-fix] Failed to patch LocalizationModule.swift:',
      error,
    );
  }
}

const withExpoLocalizationCalendarFix = (config) =>
  withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      await patchLocalizationModule(modConfig.modRequest.projectRoot);
      return modConfig;
    },
  ]);

module.exports = withExpoLocalizationCalendarFix;
module.exports.default = withExpoLocalizationCalendarFix;
module.exports.patchLocalizationModule = patchLocalizationModule;
