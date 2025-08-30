import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from './theme/ThemeProvider';

export interface MessageBubbleProps {
  text: string;
  time: string;
  isOutgoing: boolean;
  isRead?: boolean;
  testID?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  time,
  isOutgoing,
  isRead,
  testID,
}) => {
  const { colors, spacing, radius, type } = useTheme();

  const containerStyle = React.useMemo<ViewStyle>(
    () => ({
      justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
      marginBottom: spacing.md,
    }),
    [isOutgoing, spacing],
  );

  const bubbleStyle = React.useMemo<ViewStyle>(
    () => ({
      backgroundColor: isOutgoing ? colors.humPrimary : colors.muted,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
      maxWidth: '80%',
    }),
    [isOutgoing, colors, spacing, radius],
  );

  const metaStyle = React.useMemo<ViewStyle>(
    () => ({ marginTop: spacing.xs, opacity: isOutgoing ? 0.7 : 1 }),
    [spacing, isOutgoing],
  );

  const messageTextStyle = React.useMemo<TextStyle>(
    () => ({
      fontSize: type.size.base,
      color: isOutgoing ? colors.humPrimaryForeground : colors.foreground,
    }),
    [isOutgoing, colors, type],
  );

  const timeTextStyle = React.useMemo<TextStyle>(
    () => ({
      fontSize: type.size.sm,
      color: isOutgoing ? colors.humPrimaryForeground : colors.mutedForeground,
    }),
    [isOutgoing, colors, type],
  );

  const checkStyle = React.useMemo<TextStyle>(
    () => ({
      marginLeft: spacing.xs,
      fontSize: type.size.sm,
      color: colors.humPrimaryForeground,
    }),
    [spacing, type, colors],
  );

  return (
    <View
      style={[styles.container, containerStyle]}
      {...(testID ? { testID, 'data-testid': testID } : {})}
    >
      <View style={[styles.bubble, bubbleStyle]}>
        <Text style={messageTextStyle}>{text}</Text>
        <View style={[styles.meta, metaStyle]}>
          <Text style={timeTextStyle}>{time}</Text>
          {isOutgoing && isRead && <Text style={checkStyle}>✓✓</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  bubble: {
    flexShrink: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

export default MessageBubble;
