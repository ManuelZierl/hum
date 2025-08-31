import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from './theme/ThemeProvider';
import { Icon } from './icons/Icon';

export interface SettingsItemProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
}) => {
  const { colors, spacing, type } = useTheme();

  return (
    <Pressable
      style={({ pressed }: { pressed: boolean }) => [
        styles.container,
        {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: pressed ? colors.muted : 'transparent',
        },
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={title}
      onPress={onPress}
    >
      <View style={styles.left}>
        {icon ? <View style={{ marginRight: spacing.md }}>{icon}</View> : null}
        <View>
          <Text
            style={{
              color: colors.foreground,
              fontSize: type.size.md,
              fontWeight: type.weight.medium,
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: type.size.sm,
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <Icon
        name="chevron-right"
        size={type.size.lg}
        color={colors.mutedForeground}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SettingsItem;
