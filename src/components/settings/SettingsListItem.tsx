import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

interface Props {
  label: string;
  onPress?: () => void;
}

const SettingsListItem = ({ label, onPress }: Props) => {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;

  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>
      <View style={[styles.container, { borderBottomColor: colors.border, backgroundColor: colors.card }]}> 
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.chevron, { color: colors.subtext }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const lightColors = { card: '#ffffff', text: '#000000', subtext: '#777777', border: '#e0e0e0' };
const darkColors = { card: '#1c1c1c', text: '#ffffff', subtext: '#aaaaaa', border: '#333333' };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  chevron: {
    fontSize: 18,
    marginLeft: 4,
  },
});

export default SettingsListItem;
