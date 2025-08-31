import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from './theme/ThemeProvider';

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  testID?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  testID,
}) => {
  const { colors, spacing, radius, type } = useTheme();
  const iconSize = spacing.xl * 2;

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          padding: spacing.xl,
          borderRadius: radius.lg,
        },
      ]}
    >
      <View style={[styles.header, { marginBottom: spacing.md }]}>
        <View
          style={[
            styles.iconCircle,
            {
              width: iconSize,
              height: iconSize,
              borderRadius: iconSize / 2,
              backgroundColor: colors.humPrimary,
              marginRight: spacing.md,
            },
          ]}
        >
          {icon}
        </View>
        <Text
          style={{
            color: colors.foreground,
            fontSize: type.size.lg,
            fontWeight: type.weight.medium,
          }}
        >
          {title}
        </Text>
      </View>
      <Text
        style={{
          color: colors.mutedForeground,
          fontSize: type.size.sm,
        }}
      >
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FeatureCard;
