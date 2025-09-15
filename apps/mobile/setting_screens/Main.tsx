import React from 'react';
import { SettingsItem, Icon, useTheme } from '@hum/ui-components';
import { SettingsScreen } from '@hum/ui-screens';
import { useTranslation } from 'react-i18next';

export type MainSettingsScreenProps = {
  theme: 'light' | 'dark' | 'auto';
  onNavigateToTheme: () => void;
};

export const MainSettingsScreen: React.FC<MainSettingsScreenProps> = ({
  theme,
  onNavigateToTheme,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const themeLabel = t(`labels.${theme}`);
  return (
    <SettingsScreen>
      <SettingsItem
        icon={<Icon name="palette" size={24} color={colors.humPrimary} />}
        title={t('labels.theme')}
        subtitle={themeLabel}
        onPress={onNavigateToTheme}
      />
    </SettingsScreen>
  );
};

export default MainSettingsScreen;
