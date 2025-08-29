import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ConversationHeader: React.FC = () => {
  const online = true;
  return (
    <View style={styles.container}>
      <Text style={styles.icon} accessibilityRole="button">
        ‹
      </Text>
      <View style={styles.profile}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View
            style={[
              styles.presenceDot,
              online ? styles.presenceOnline : styles.presenceOffline,
            ]}
          />
        </View>
        <Text style={styles.name}>Alice</Text>
      </View>
      <Text style={styles.icon} accessibilityRole="button">
        ⋮
      </Text>
    </View>
  );
};

const AVATAR_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  icon: {
    fontSize: 24,
    width: 24,
    textAlign: 'center',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    color: '#fff',
  },
  presenceDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
    right: -2,
    bottom: -2,
  },
  presenceOnline: {
    backgroundColor: '#4caf50',
  },
  presenceOffline: {
    backgroundColor: '#9e9e9e',
  },
  name: {
    fontSize: 16,
  },
});

export default ConversationHeader;
