import i18n from './src/index';

describe('i18n configuration', () => {
  beforeAll(async () => {
    if (!i18n.isInitialized) {
      await new Promise<void>((resolve) => {
        const handle = () => {
          i18n.off('initialized', handle);
          resolve();
        };
        i18n.on('initialized', handle);
      });
    }
    await i18n.changeLanguage('en');
  });

  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('provides English translations by default', () => {
    expect(i18n.t('nav.chats')).toBe('Chats');
    expect(i18n.t('actions.back')).toBe('Go back');
  });

  it('switches to German translations when requested', async () => {
    await i18n.changeLanguage('de');
    expect(i18n.t('nav.settings')).toBe('Einstellungen');
    expect(i18n.t('actions.search')).toBe('Suchen');
  });

  it('falls back to English for unsupported locales', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('nav.payments')).toBe('Payments');
  });
});
