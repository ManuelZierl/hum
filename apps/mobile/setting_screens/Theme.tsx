import React from 'react';
import { ListRow } from '@hum/ui-components';
import { SettingsScreen } from '@hum/ui-screens';

export type ThemeSettingsScreenProps = {
  theme: 'light' | 'dark' | 'auto';
  onBack: () => void;
  onSelectTheme: (theme: 'light' | 'dark' | 'auto') => void;
};

export const ThemeSettingsScreen: React.FC<ThemeSettingsScreenProps> = ({
  theme,
  onBack,
  onSelectTheme,
}) => (
  <SettingsScreen onBack={onBack}>
    <ListRow
      label="Light"
      onPress={() => onSelectTheme('light')}
      rightText={theme === 'light' ? '✓' : undefined}
    />
    <ListRow
      label="Dark"
      onPress={() => onSelectTheme('dark')}
      rightText={theme === 'dark' ? '✓' : undefined}
    />
    <ListRow
      label="Auto"
      onPress={() => onSelectTheme('auto')}
      rightText={theme === 'auto' ? '✓' : undefined}
    />
  </SettingsScreen>
);

export default ThemeSettingsScreen;
