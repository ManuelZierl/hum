import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { spacing, typography, useTheme } from '@mchat/ui-tokens';

export type LightningBoltProps = {
  label?: string;
};

const LightningBolt: React.FC<LightningBoltProps> = ({
  label = 'Lightning',
}) => {
  const { colors } = useTheme();
  return (
    <Text style={[styles.text, { color: colors.primary }]}>⚡ {label}</Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: typography.fontSize.lg,
    margin: spacing.md,
    fontWeight: 'bold',
  },
});

export default LightningBolt;
