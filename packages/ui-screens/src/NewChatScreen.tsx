import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@hum/ui-components';

export function NewChatScreen() {
  const { colors } = useTheme();
  const STRINGS = { title: 'New Chat' } as const;
  return (
    <View style={styles.container}>
      <Text style={{ color: colors.foreground }}>{STRINGS.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
});

export default NewChatScreen;
