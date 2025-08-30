import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@hum/ui-components';
import { Button } from '@hum/ui-components/button';
import { Text } from 'react-native';

export interface TopBarProps {
  onMorePress?: () => void;
  onCameraPress?: () => void;
  onPlusPress?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onMorePress,
  onCameraPress,
  onPlusPress,
}) => {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="topbar-container"
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: spacing.lg,
          paddingHorizontal: spacing.lg,
          backgroundColor: colors.background,
        },
      ]}
      accessible={false}
    >
      <Pressable
        accessibilityRole={onMorePress ? 'button' : undefined}
        accessibilityLabel="More options"
        onPress={onMorePress}
        style={styles.iconWrapper}
      >
        <Text style={[styles.icon, { color: colors.foreground }]}>⋯</Text>
      </Pressable>

      <View style={styles.rightGroup}>
        <Pressable
          accessibilityRole={onCameraPress ? 'button' : undefined}
          accessibilityLabel="Open camera"
          onPress={onCameraPress}
          style={[styles.iconWrapper, { marginRight: spacing.md }]}
        >
          <Text style={[styles.icon, { color: colors.foreground }]}>📷</Text>
        </Pressable>
        <Button
          size="icon"
          style={[styles.plusButton, { backgroundColor: colors.humPrimary }]}
          accessibilityLabel="Create new"
          onPress={onPlusPress}
        >
          <Text
            style={[styles.plusIcon, { color: colors.humPrimaryForeground }]}
          >
            +
          </Text>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    padding: 4,
  },
  icon: {
    fontSize: 24,
  },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  plusIcon: {
    fontSize: 24,
  },
});

export default TopBar;
