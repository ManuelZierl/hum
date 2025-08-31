import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, useTheme, Icon } from '@hum/ui-components';

export interface TopBarProps {
  onMenuPress?: () => void;
  onCameraPress?: () => void;
  onAddPress?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onMenuPress,
  onCameraPress,
  onAddPress,
}) => {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: spacing.lg,
          paddingHorizontal: spacing.lg,
          backgroundColor: colors.background,
        },
      ]}
    >
      <Pressable
        onPress={onMenuPress}
        accessibilityRole="button"
        accessibilityLabel="More options"
      >
        <Text style={[styles.icon, { color: colors.foreground }]}>⋯</Text>
      </Pressable>

      <View style={styles.rightContainer}>
        <Pressable
          onPress={onCameraPress}
          accessibilityRole="button"
          accessibilityLabel="Open camera"
          style={{ marginRight: spacing.lg }}
        >
          <Icon name="camera" size={24} color={colors.foreground} />
        </Pressable>

        <Button
          size="icon"
          accessibilityLabel="Add"
          onPress={onAddPress}
          style={styles.addButton}
        >
          <Text
            style={[styles.addIcon, { color: colors.humPrimaryForeground }]}
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  addIcon: {
    fontSize: 24,
  },
});

export default TopBar;
