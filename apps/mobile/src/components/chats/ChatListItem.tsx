import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Avatar from './Avatar';
import UnreadBadge from './UnreadBadge';

export interface ChatListItemProps {
  title: string;
  preview: string;
  time: string;
  unreadCount?: number;
  muted?: boolean;
  pinned?: boolean;
  avatarUri?: string;
  style?: ViewStyle;
}

export default function ChatListItem({
  title,
  preview,
  time,
  unreadCount,
  muted,
  pinned,
  avatarUri,
  style,
}: ChatListItemProps) {
  const accessibility = `Chat with ${title}${
    unreadCount ? `, ${unreadCount} unread messages` : ''
  }`;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibility}
    >
      {pinned && <Text style={styles.pin}>📌</Text>}
      <Avatar title={title} avatarUri={avatarUri} />
      <View style={styles.content}>
        <View style={styles.rowTop}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={styles.preview} numberOfLines={1}>
            {preview}
          </Text>
          <View style={styles.rightIcons}>
            {muted && <Text style={styles.muted}>🔇</Text>}
            {typeof unreadCount === 'number' && unreadCount > 0 && (
              <UnreadBadge count={unreadCount} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const ROW_HEIGHT = 72;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: ROW_HEIGHT,
    backgroundColor: 'transparent',
  },
  pin: {
    marginRight: 4,
    fontSize: 16,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    height: '100%',
    justifyContent: 'center',
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  preview: {
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  time: {
    color: '#666',
    fontSize: 12,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muted: {
    marginRight: 4,
  },
});

export const getItemLayout = (_: unknown, index: number) => ({
  length: ROW_HEIGHT,
  offset: ROW_HEIGHT * index,
  index,
});
