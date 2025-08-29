import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type DaySeparatorProps = {
  label: string;
};

const DaySeparator: React.FC<DaySeparatorProps> = ({ label }) => (
  <View style={styles.container}>
    <View style={styles.line} />
    <Text style={styles.label} accessibilityRole="text">
      {label}
    </Text>
    <View style={styles.line} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ccc',
  },
  label: {
    marginHorizontal: 8,
    fontSize: 12,
    color: '#555',
  },
});

export default DaySeparator;
