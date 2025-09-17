import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@hum/ui-components';

const STRINGS = {
  title: 'New Call',
} as const;

export function NewCallScreen() {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={{ color: colors.foreground }}>{STRINGS.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
});

export default NewCallScreen;
