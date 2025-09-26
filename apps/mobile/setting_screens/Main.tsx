import React from 'react';
import {
  SettingsItem,
  Icon,
  useTheme,
  useTypography,
} from '@hum/ui-components';
import { SettingsScreen } from '@hum/ui-screens';
import { useTranslation } from 'react-i18next';
import Slider from '@react-native-community/slider';
import { View, Text, StyleSheet } from 'react-native';

export type MainSettingsScreenProps = {
  theme: 'light' | 'dark' | 'auto';
  onNavigateToTheme: () => void;
  onClearStorage?: () => Promise<void> | void;
};

export const MainSettingsScreen: React.FC<MainSettingsScreenProps> = ({
  theme,
  onNavigateToTheme,
  onClearStorage,
}) => {
  const { colors, spacing, radius, type } = useTheme();
  const { scaleIndex, presets, setScaleIndex, preset } = useTypography();
  const { t } = useTranslation();
  const themeLabel = t(`labels.${theme}`);
  const sliderMax = Math.max(0, presets.length - 1);

  const handleSliderChange = React.useCallback(
    (value: number) => {
      setScaleIndex(value);
    },
    [setScaleIndex],
  );
  return (
    <SettingsScreen onClearStorage={onClearStorage}>
      <SettingsItem
        icon={<Icon name="palette" size={24} color={colors.humPrimary} />}
        title={t('labels.theme')}
        subtitle={themeLabel}
        onPress={onNavigateToTheme}
      />
      <View
        style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            padding: spacing.lg,
          }}
        >
          <View style={styles.container}>
            <Text
              style={{
                color: colors.foreground,
                fontSize: type.size.lg,
                fontWeight: type.weight.medium,
              }}
            >
              {t('text_size.label')}
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: type.size.sm,
              }}
            >
              {t(preset.labelKey)}
            </Text>
          </View>
          <Slider
            value={scaleIndex}
            minimumValue={0}
            maximumValue={sliderMax}
            step={1}
            onValueChange={handleSliderChange}
            minimumTrackTintColor={colors.humPrimary}
            maximumTrackTintColor={colors.muted}
            thumbTintColor={colors.humPrimary}
            style={[styles.slider, { marginTop: spacing.md }]}
            accessibilityLabel={t('text_size.label')}
            accessibilityRole="adjustable"
          />
          <View style={{ marginTop: spacing.lg }}>
            <Text
              style={{
                color: colors.foreground,
                fontSize: type.size.lg,
                fontWeight: type.weight.bold,
                marginBottom: spacing.xs,
              }}
            >
              {t('text_size.preview_title')}
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: type.size.md,
                lineHeight: type.lineHeight.relaxed,
              }}
            >
              {t('text_size.preview_body')}
            </Text>
          </View>
        </View>
      </View>
    </SettingsScreen>
  );
};

const styles = StyleSheet.create({
  slider: {
    width: '100%',
    height: 40,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default MainSettingsScreen;
