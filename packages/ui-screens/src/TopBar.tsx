import React from 'react';
import { View, Pressable, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '@hum/ui-components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export interface TopBarProps extends ViewProps {
  onMorePress?: () => void;
  onCameraPress?: () => void;
  onAddPress?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onMorePress,
  onCameraPress,
  onAddPress,
  style,
  ...rest
}) => {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: spacing.lg,
          paddingHorizontal: spacing.lg,
        },
        style,
      ]}
      {...rest}
    >
      <Pressable
        accessible
        accessibilityRole="button"
        accessibilityLabel="More options"
        onPress={onMorePress}
        hitSlop={8}
        style={styles.iconButton}
      >
        <Feather name="more-horizontal" size={24} color={colors.foreground} />
      </Pressable>

      <View style={styles.rightGroup}>
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel="Open camera"
          onPress={onCameraPress}
          hitSlop={8}
          style={[styles.iconButton, { marginRight: spacing.lg }]}
        >
          <Feather name="camera" size={24} color={colors.foreground} />
        </Pressable>

        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel="Add"
          onPress={onAddPress}
          hitSlop={8}
          style={[styles.addButton, { backgroundColor: colors.humPrimary }]}
        >
          <Feather name="plus" size={24} color={colors.humPrimaryForeground} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TopBar;
