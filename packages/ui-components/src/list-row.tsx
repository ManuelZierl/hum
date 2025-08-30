import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from './theme/ThemeProvider';

export interface ListRowProps {
  icon?: React.ReactNode;
  label: string;
  rightText?: string;
  onPress?: () => void;
}

export const ListRow: React.FC<ListRowProps> = ({
  icon,
  label,
  rightText,
  onPress,
}) => {
  const { colors, spacing, type } = useTheme();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.container,
        {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: pressed ? colors.muted : 'transparent',
        },
      ]}
    >
      <View style={styles.left}>
        {icon ? <View style={{ marginRight: spacing.sm }}>{icon}</View> : null}
        <Text
          style={{
            color: colors.foreground,
            fontSize: type.size.md,
            fontWeight: type.weight.normal,
          }}
        >
          {label}
        </Text>
      </View>
      {rightText ? (
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: type.size.sm,
          }}
        >
          {rightText}
        </Text>
      ) : null}
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

export default ListRow;
