import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export interface UnreadBadgeProps {
  count: number;
}

export default function UnreadBadge({ count }: UnreadBadgeProps) {
  const display = count > 99 ? '99+' : String(count);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#25d366',
    borderRadius: 10,
    paddingHorizontal: 6,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
