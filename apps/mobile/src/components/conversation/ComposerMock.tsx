import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ComposerMock: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.icon} accessibilityRole="button">
      ＋
    </Text>
    <View style={styles.input}>
      <Text style={styles.placeholder}>Message</Text>
    </View>
    <Text style={styles.icon} accessibilityRole="button">
      🎤
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
  icon: {
    fontSize: 24,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  placeholder: {
    color: '#888',
    fontSize: 16,
  },
});

export default ComposerMock;
