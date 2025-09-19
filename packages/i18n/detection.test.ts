import type { i18n as I18nInstance } from 'i18next';

type LocalizationFactory = () => unknown;
type NavigatorLike = { language?: string };
type TestingModule = {
  default: I18nInstance;
  __testing__: {
    detectFromNativeApis: () => string;
  };
};

async function importDetector(
  factory: LocalizationFactory,
): Promise<() => string> {
  jest.doMock('expo-localization', factory);
  const module = (await import('./src/index')) as TestingModule;
  return module.__testing__.detectFromNativeApis;
}

describe('native language detection', () => {
  const originalWindow = (globalThis as { window?: unknown }).window;
  const originalDocument = (globalThis as { document?: unknown }).document;
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    'navigator',
  );
  const originalIntl = globalThis.Intl;

  function setNavigator(value: NavigatorLike | undefined): void {
    try {
      Object.defineProperty(globalThis, 'navigator', {
        value,
        configurable: true,
        writable: true,
      });
    } catch {
      (globalThis as { navigator?: NavigatorLike }).navigator = value;
    }
  }

  beforeEach(() => {
    jest.resetModules();
    if (Reflect.has(globalThis, 'window')) {
      Reflect.deleteProperty(globalThis, 'window');
    }
    if (Reflect.has(globalThis, 'document')) {
      Reflect.deleteProperty(globalThis, 'document');
    }
    setNavigator(undefined);
    globalThis.Intl = originalIntl;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.dontMock('expo-localization');
  });

  afterAll(() => {
    if (typeof originalWindow === 'undefined') {
      Reflect.deleteProperty(globalThis, 'window');
    } else {
      (globalThis as { window?: unknown }).window = originalWindow;
    }

    if (typeof originalDocument === 'undefined') {
      Reflect.deleteProperty(globalThis, 'document');
    } else {
      (globalThis as { document?: unknown }).document = originalDocument;
    }

    if (navigatorDescriptor) {
      Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
    } else {
      setNavigator(undefined);
    }

    globalThis.Intl = originalIntl;
  });

  it('prefers the language code reported by expo-localization', async () => {
    const detect = await importDetector(() => ({
      getLocales: () => [
        {
          languageCode: 'de',
          languageTag: 'de-DE',
        },
      ],
    }));

    expect(detect()).toBe('de');
  });

  it('falls back to the language from the language tag when the code is missing', async () => {
    const detect = await importDetector(() => ({
      getLocales: () => [
        {
          languageTag: 'de-CH',
        },
      ],
    }));

    expect(detect()).toBe('de');
  });

  it('uses the navigator language when expo-localization provides no locales', async () => {
    setNavigator({ language: 'de-AT' });

    const detect = await importDetector(() => ({
      getLocales: () => [],
    }));

    expect(detect()).toBe('de');
  });

  it('ignores expo-localization when it does not provide a getLocales function', async () => {
    setNavigator({ language: 'de-DE' });

    const detect = await importDetector(() => ({}));

    expect(detect()).toBe('de');
  });

  it('reads the locale from Intl when navigator is unavailable', async () => {
    setNavigator(undefined);

    globalThis.Intl = {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ locale: 'de-DE' }),
      }),
    } as unknown as typeof Intl;

    const detect = await importDetector(() => ({
      getLocales: () => [],
    }));

    expect(detect()).toBe('de');
  });

  it('falls back to English when no other signal is available', async () => {
    setNavigator(undefined);
    globalThis.Intl = undefined as unknown as typeof Intl;

    const detect = await importDetector(() => ({
      getLocales: () => [],
    }));

    expect(detect()).toBe('en');
  });

  it('ignores expo-localization errors and still resolves to a language', async () => {
    setNavigator({ language: 'de-DE' });

    const detect = await importDetector(() => {
      throw new Error('expo-localization missing');
    });

    expect(detect()).toBe('de');
  });
});
