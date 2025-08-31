import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from './theme/ThemeProvider';

export interface BottomNavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  badgeCount?: number;
  testID?: string;
}

export const BottomNavItem: React.FC<BottomNavItemProps> = ({
  icon,
  label,
  isActive = false,
  onPress,
  badgeCount = 0,
  testID,
}) => {
  const { colors, spacing, type } = useTheme();
  const iconColor = isActive ? colors.humPrimary : colors.mutedForeground;

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(
        icon as React.ReactElement<{
          color?: string;
          size?: number;
          style?: object;
        }>,
        {
          color: iconColor,
          size: 24,
          style: (icon as React.ReactElement<{ style?: object }>).props.style,
        },
      );
    }
    return icon;
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      testID={testID}
      style={({ pressed }: { pressed: boolean }) => [
        styles.container,
        {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.sm,
          minHeight: 60,
        },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View style={styles.iconWrapper}>
        {renderIcon()}
        {badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.humPrimary }]}>
            <Text
              style={[
                styles.badgeText,
                {
                  color: colors.humPrimaryForeground,
                  fontSize: type.size.sm,
                  fontWeight: type.weight.medium,
                },
              ]}
            >
              {badgeCount > 9 ? '9+' : badgeCount}
            </Text>
          </View>
        )}
      </View>
      <Text
        style={[
          styles.label,
          {
            color: isActive ? colors.humPrimary : colors.mutedForeground,
            fontSize: type.size.sm,
            marginTop: spacing.xs,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    textAlign: 'center',
  },
  label: {
    textAlign: 'center',
  },
});

export default BottomNavItem;
