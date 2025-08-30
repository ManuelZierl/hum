/* eslint-disable react-native/no-unused-styles */
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from './theme/ThemeProvider';

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  style,
  testID = 'feature-card',
}) => {
  const { colors, spacing, radius, type } = useTheme();

  const themedStyles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.lg,
          padding: spacing.lg,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.md,
        },
        iconWrap: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.humPrimary,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing.md,
        },
        title: {
          fontSize: type.size.lg,
          color: colors.foreground,
          fontWeight: type.weight.medium,
        },
        description: {
          fontSize: type.size.sm,
          color: colors.mutedForeground,
        },
      }),
    [colors, spacing, radius, type],
  );

  return (
    <View style={[themedStyles.container, style]} testID={testID}>
      <View style={themedStyles.header}>
        <View style={themedStyles.iconWrap}>{icon}</View>
        <Text style={themedStyles.title}>{title}</Text>
      </View>
      <Text style={themedStyles.description}>{description}</Text>
    </View>
  );
};

export default FeatureCard;
