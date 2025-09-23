import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  GestureResponderEvent,
  Animated,
} from 'react-native';
import { useTheme } from './theme/theme-provider';

export interface BottomNavItemProps {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  badgeCount?: number;
  testID?: string;
}

export const BottomNavItem: React.FC<BottomNavItemProps> = ({
  icon,
  activeIcon,
  label,
  isActive = false,
  onPress,
  badgeCount = 0,
  testID,
}) => {
  const { colors, spacing, type } = useTheme();
  const iconColor = isActive ? colors.humPrimary : colors.mutedForeground;
  const scale = React.useRef(new Animated.Value(1)).current;
  const wasActive = React.useRef(isActive);

  const bounce = React.useCallback(() => {
    scale.stopAnimation(() => {
      scale.setValue(1);
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.12,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [scale]);

  React.useEffect(() => {
    if (isActive && !wasActive.current) {
      bounce();
    }

    if (!isActive && wasActive.current) {
      scale.stopAnimation();
      scale.setValue(1);
    }

    wasActive.current = isActive;
  }, [bounce, isActive, scale]);

  const renderIcon = () => {
    const iconElement = isActive && activeIcon ? activeIcon : icon;
    if (React.isValidElement(iconElement)) {
      return React.cloneElement(
        iconElement as React.ReactElement<{
          color?: string;
          size?: number;
          style?: object;
        }>,
        {
          color: iconColor,
          size: 24,
          style: (iconElement as React.ReactElement<{ style?: object }>).props
            .style,
        },
      );
    }
    return iconElement;
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      onPressIn={bounce}
      testID={testID}
      android_ripple={{ color: 'transparent' }}
      style={() => [
        styles.container,
        {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.sm,
          minHeight: 52,
        },
      ]}
    >
      <Animated.View style={[styles.iconWrapper, { transform: [{ scale }] }]}>
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
      </Animated.View>
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
    overflow: 'visible',
  },
  iconWrapper: {
    position: 'relative',
    overflow: 'visible',
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
