import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from './theme/ThemeProvider';

export interface MessageBubbleProps {
  /** Message text */
  text: string;
  /** Time string like 14:15 */
  time: string;
  /** Whether the message is outgoing */
  isOutgoing: boolean;
  /** Whether the outgoing message has been read */
  isRead?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  time,
  isOutgoing,
  isRead,
}) => {
  const { colors, spacing, radius, type } = useTheme();
  const dynamicStyles = { marginBottom: spacing.sm };
  const justifyStyle = isOutgoing ? styles.justifyEnd : styles.justifyStart;

  return (
    <View style={[styles.container, justifyStyle, dynamicStyles]}>
      <View
        testID={isOutgoing ? 'outgoing-bubble' : 'incoming-bubble'}
        accessible
        accessibilityLabel={
          isOutgoing ? 'Outgoing message' : 'Incoming message'
        }
        style={[
          styles.bubble,
          {
            backgroundColor: isOutgoing ? colors.humPrimary : colors.muted,
            borderRadius: radius.xl,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: isOutgoing
                ? colors.humPrimaryForeground
                : colors.foreground,
              fontSize: type.size.sm,
            },
          ]}
        >
          {text}
        </Text>
        <View
          style={[
            styles.metaRow,
            {
              marginTop: spacing.xs,
            },
          ]}
        >
          <Text
            style={[
              styles.time,
              {
                color: isOutgoing
                  ? colors.humPrimaryForeground
                  : colors.mutedForeground,
                fontSize: type.size.sm,
              },
            ]}
          >
            {time}
          </Text>
          {isOutgoing && isRead && (
            <Text
              style={[
                styles.read,
                { marginLeft: spacing.xs, color: colors.humPrimaryForeground },
              ]}
            >
              ✓✓
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
  },
  text: {},
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  time: {},
  read: {},
});

export default MessageBubble;
