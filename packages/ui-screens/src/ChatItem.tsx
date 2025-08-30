import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Avatar, AvatarImage } from '../../ui-components/src/avatar';
import { useTheme } from '../../ui-components/src/theme/ThemeProvider';

export interface ChatItemProps {
  name: string;
  message: string;
  time: string;
  avatar: string;
  isRead?: boolean;
  isGroup?: boolean;
  hasLocation?: boolean;
  hasHeart?: boolean;
  unreadCount?: number;
  onPress?: () => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  name,
  message,
  time,
  avatar,
  isRead = false,
  hasLocation = false,
  hasHeart = false,
  unreadCount = 0,
  onPress,
}) => {
  const { colors, spacing, type } = useTheme();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={`Chat with ${name}`}
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.container,
        {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: pressed ? colors.muted : 'transparent',
        },
      ]}
    >
      <View style={{ marginRight: spacing.md }}>
        <Avatar size={48}>
          <AvatarImage
            source={{ uri: avatar }}
            accessibilityLabel={`${name} avatar`}
          />
        </Avatar>
        {unreadCount > 0 && (
          <View
            testID="unread-badge"
            style={[styles.unreadBadge, { backgroundColor: colors.humPrimary }]}
            accessible
            accessibilityLabel={`${unreadCount} unread messages`}
          >
            <Text
              style={[
                styles.unreadText,
                {
                  color: colors.humPrimaryForeground,
                  fontSize: type.size.sm,
                  fontWeight: type.weight.bold,
                },
              ]}
            >
              {unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.name,
                {
                  color: colors.foreground,
                  fontSize: type.size.md,
                  fontWeight: type.weight.medium,
                },
              ]}
              numberOfLines={1}
            >
              {name}
            </Text>
            {hasHeart && <Text style={styles.icon}>❤️</Text>}
            {hasLocation && <Text style={styles.icon}>📍</Text>}
          </View>
          <Text
            style={[
              styles.time,
              { color: colors.mutedForeground, fontSize: type.size.sm },
            ]}
          >
            {time}
          </Text>
        </View>

        <View style={styles.messageRow}>
          {isRead && (
            <Text style={[styles.icon, { marginRight: spacing.xs }]}>✓✓</Text>
          )}
          <Text
            style={[
              styles.message,
              { color: colors.mutedForeground, fontSize: type.size.sm },
            ]}
            numberOfLines={1}
          >
            {message}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    marginRight: 4,
  },
  icon: {
    marginLeft: 4,
  },
  time: {
    flexShrink: 0,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    flexShrink: 1,
  },
  unreadBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    textAlign: 'center',
  },
});

export default ChatItem;
