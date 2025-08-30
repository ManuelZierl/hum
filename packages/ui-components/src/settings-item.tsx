import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  PressableProps,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from './theme/ThemeProvider';

export interface SettingsItemProps extends Omit<PressableProps, 'style'> {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

const baseStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flexShrink: 1,
  },
  title: {
    fontWeight: '500',
  },
  subtitle: {},
});

export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  ...props
}) => {
  const { colors, spacing, type } = useTheme();

  const containerStyle = React.useMemo(
    () => [
      baseStyles.container,
      { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
    ],
    [spacing.lg],
  );

  const iconWrapperStyle = React.useMemo(
    () => [baseStyles.iconWrapper, { marginRight: spacing.md }],
    [spacing.md],
  );

  const titleStyle = React.useMemo(
    () => [
      baseStyles.title,
      { color: colors.foreground, fontSize: type.size.base },
    ],
    [colors.foreground, type.size.base],
  );

  const subtitleStyle = React.useMemo(
    () => [
      baseStyles.subtitle,
      { color: colors.mutedForeground, fontSize: type.size.sm, marginTop: 2 },
    ],
    [colors.mutedForeground, type.size.sm],
  );

  const chevronColor = colors.mutedForeground;

  return (
    <Pressable
      accessible
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        containerStyle,
        pressed && { backgroundColor: colors.muted },
      ]}
      {...props}
    >
      <View style={baseStyles.left}>
        <View style={iconWrapperStyle}>{icon}</View>
        <View style={baseStyles.textContainer}>
          <Text style={titleStyle}>{title}</Text>
          {subtitle ? <Text style={subtitleStyle}>{subtitle}</Text> : null}
        </View>
      </View>
      <ChevronRight
        size={20}
        color={chevronColor}
        accessibilityElementsHidden
      />
    </Pressable>
  );
};

export default SettingsItem;
