import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';

export interface AvatarProps {
  title: string;
  avatarUri?: string;
  size?: number;
}

export default function Avatar({ title, avatarUri, size = 48 }: AvatarProps) {
  const initials =
    !title || !title.trim()
      ? ''
      : title
          .split(' ')
          .filter((p) => p.trim().length > 0)
          .map((p) => p[0])
          .join('')
          .toUpperCase();

  if (avatarUri) {
    return (
      <Image
        source={{ uri: avatarUri }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={styles.initials}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#555',
    fontWeight: 'bold',
  },
});
