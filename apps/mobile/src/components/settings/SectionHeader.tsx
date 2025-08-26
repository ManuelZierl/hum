import React from 'react';
import { Text, StyleSheet, useColorScheme } from 'react-native';

interface Props {
  title: string;
}

const SectionHeader = ({ title }: Props) => {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;

  return <Text style={[styles.header, { color: colors.subtext }]}>{title}</Text>;
};

const lightColors = { subtext: '#555555' };
const darkColors = { subtext: '#aaaaaa' };

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SectionHeader;
