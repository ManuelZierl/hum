import React from 'react';
import { ListRow } from '@hum/ui-components';
import { SettingsScreen } from '@hum/ui-screens';
import { useTranslation } from 'react-i18next';

export type ThemeSettingsScreenProps = {
  theme: 'light' | 'dark' | 'auto';
  onBack: () => void;
  onSelectTheme: (theme: 'light' | 'dark' | 'auto') => void;
};

export const ThemeSettingsScreen: React.FC<ThemeSettingsScreenProps> = ({
  theme,
  onBack,
  onSelectTheme,
}) => {
  const { t } = useTranslation();
  return (
    <SettingsScreen onBack={onBack}>
      <ListRow
        label={t('labels.light')}
        onPress={() => onSelectTheme('light')}
        rightText={theme === 'light' ? '✓' : undefined}
      />
      <ListRow
        label={t('labels.dark')}
        onPress={() => onSelectTheme('dark')}
        rightText={theme === 'dark' ? '✓' : undefined}
      />
      <ListRow
        label={t('labels.auto')}
        onPress={() => onSelectTheme('auto')}
        rightText={theme === 'auto' ? '✓' : undefined}
      />
    </SettingsScreen>
  );
};

export default ThemeSettingsScreen;
