import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography, useTheme } from '@mchat/ui-tokens';

export type MessageBubbleProps = {
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  isReply?: boolean;
  isSelected?: boolean;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  sender,
  text,
  timestamp,
  status,
  isReply,
  isSelected,
}) => {
  const isMe = sender === 'me';
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        isMe ? styles.meContainer : styles.themContainer,
        { backgroundColor: isMe ? colors.primary : colors.background },
        isSelected && styles.selected,
        isSelected && { borderColor: colors.primary },
      ]}
    >
      {isReply && (
        <Text style={[styles.reply, { color: colors.text, opacity: 0.6 }]}>Reply</Text>
      )}
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
      <View style={styles.metaRow}>
        <Text style={[styles.timestamp, { color: colors.text, opacity: 0.6 }]}>
          {timestamp}
        </Text>
        {isMe && status && (
          <Text style={[styles.status, { color: colors.text, opacity: 0.6 }]}>
            {status}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
  },
  meContainer: {
    alignSelf: 'flex-end',
  },
  themContainer: {
    alignSelf: 'flex-start',
  },
  selected: {
    borderWidth: spacing.xs / 2,
  },
  reply: {
    fontSize: typography.fontSize.xs,
    marginBottom: spacing.xs,
  },
  text: {
    fontSize: typography.fontSize.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
  },
  status: {
    fontSize: typography.fontSize.xs,
    marginLeft: spacing.xs,
  },
});

export default MessageBubble;

