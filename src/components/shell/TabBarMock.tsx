import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

const TabBarMock = () => {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;

  const tabs = [
    { label: 'Chats', icon: '💬' },
    { label: 'Calls', icon: '📞' },
    { label: 'Settings', icon: '⚙️' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}> 
      {tabs.map((tab) => (
        <View key={tab.label} style={styles.tab}>
          <Text style={styles.icon}>{tab.icon}</Text>
          <Text style={[styles.label, { color: colors.text }]}>{tab.label}</Text>
        </View>
      ))}
    </View>
  );
};

const lightColors = { card: '#ffffff', text: '#222222', border: '#e0e0e0' };
const darkColors = { card: '#1c1c1c', text: '#f2f2f2', border: '#333333' };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
  },
});

export default TabBarMock;
