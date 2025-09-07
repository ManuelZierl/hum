import React from 'react';
import { SettingsItem, Icon, useTheme } from '@hum/ui-components';
import { SettingsScreen } from '@hum/ui-screens';

export type MainSettingsScreenProps = {
  theme: 'light' | 'dark' | 'auto';
  onNavigateToTheme: () => void;
};

export const MainSettingsScreen: React.FC<MainSettingsScreenProps> = ({
  theme,
  onNavigateToTheme,
}) => {
  const { colors } = useTheme();
  const themeLabel =
    theme === 'auto' ? 'Auto' : theme.charAt(0).toUpperCase() + theme.slice(1);
  return (
    <SettingsScreen>
      <SettingsItem
        icon={<Icon name="palette" size={24} color={colors.humPrimary} />}
        title="Theme"
        subtitle={themeLabel}
        onPress={onNavigateToTheme}
      />
    </SettingsScreen>
  );
};

export default MainSettingsScreen;
