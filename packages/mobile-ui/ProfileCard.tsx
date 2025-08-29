import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

export interface ProfileCardProps {
  name: string;
  handle: string;
}

const ProfileCard = ({ name, handle }: ProfileCardProps) => {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, shadowColor: colors.shadow },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.avatar }]} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.handle, { color: colors.subtext }]}>{handle}</Text>
      </View>
      <Text style={[styles.qr, { color: colors.subtext }]}>QR</Text>
    </View>
  );
};

const lightColors = {
  card: '#ffffff',
  text: '#000000',
  subtext: '#555555',
  avatar: '#cccccc',
  shadow: '#000000',
};
const darkColors = {
  card: '#222222',
  text: '#ffffff',
  subtext: '#aaaaaa',
  avatar: '#444444',
  shadow: '#000000',
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 2,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  handle: {
    marginTop: 4,
    fontSize: 14,
  },
  qr: {
    fontSize: 16,
  },
});

export default ProfileCard;
