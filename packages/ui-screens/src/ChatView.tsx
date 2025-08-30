import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, AvatarImage } from '../../ui-components/src/avatar';
import { useTheme } from '../../ui-components/src/theme/ThemeProvider';
import {
  MessageBubble,
  type MessageBubbleProps,
} from '../../ui-components/src/message-bubble';

export interface ChatMessage extends MessageBubbleProps {
  id: string;
}

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    text: 'Hey! How are you doing?',
    time: '14:15',
    isOutgoing: false,
  },
  {
    id: '2',
    text: "I'm doing great! Just finished work. What about you?",
    time: '14:17',
    isOutgoing: true,
    isRead: true,
  },
  {
    id: '3',
    text: 'Same here! Just wrapped up a big project',
    time: '14:18',
    isOutgoing: false,
  },
  {
    id: '4',
    text: "That's awesome! What kind of project was it?",
    time: '14:20',
    isOutgoing: true,
    isRead: true,
  },
];

export interface ChatViewProps {
  chatName: string;
  chatAvatar: string;
  onBack: () => void;
  messages?: ChatMessage[];
}

export const ChatView: React.FC<ChatViewProps> = ({
  chatName,
  chatAvatar,
  onBack,
  messages = mockMessages,
}) => {
  const { colors, spacing, type, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState('');

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{ marginRight: spacing.sm }}
          >
            <Text style={[styles.iconLarge, { color: colors.foreground }]}>
              {'←'}
            </Text>
          </Pressable>
          <Avatar size={40}>
            <AvatarImage
              source={{ uri: chatAvatar }}
              accessibilityLabel={`${chatName} avatar`}
            />
          </Avatar>
          <View style={{ marginLeft: spacing.sm }}>
            <Text
              style={{
                color: colors.foreground,
                fontSize: type.size.md,
                fontWeight: type.weight.medium,
              }}
            >
              {chatName}
            </Text>
            <Text
              style={{ color: colors.mutedForeground, fontSize: type.size.sm }}
            >
              online
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text
            style={[
              styles.iconLarge,
              { marginRight: spacing.md, color: colors.foreground },
            ]}
          >
            {'🎥'}
          </Text>
          <Text
            style={[
              styles.iconLarge,
              { marginRight: spacing.md, color: colors.foreground },
            ]}
          >
            {'📞'}
          </Text>
          <Text style={[styles.iconLarge, { color: colors.foreground }]}>
            {'⋮'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.messages}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
        }}
      >
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            text={m.text}
            time={m.time}
            isOutgoing={m.isOutgoing}
            isRead={m.isRead}
          />
        ))}
      </ScrollView>

      <View
        style={[
          styles.inputArea,
          {
            borderTopColor: colors.border,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <View style={styles.inputRow}>
          <Text
            style={[
              styles.iconLarge,
              { marginRight: spacing.sm, color: colors.mutedForeground },
            ]}
          >
            {'+'}
          </Text>
          <View
            style={[
              styles.textInputContainer,
              {
                backgroundColor: colors.muted,
                borderRadius: radius.xl,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
              },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: colors.foreground }]}
              placeholder="Type a message..."
              placeholderTextColor={colors.mutedForeground}
              value={value}
              onChangeText={setValue}
              accessible
              accessibilityLabel="Message input"
            />
            <Text style={[styles.iconSmall, { color: colors.mutedForeground }]}>
              {'😊'}
            </Text>
          </View>
          <Text
            style={[
              styles.iconLarge,
              { marginLeft: spacing.sm, color: colors.mutedForeground },
            ]}
          >
            {'📷'}
          </Text>
          <Text
            style={[
              styles.iconLarge,
              { marginLeft: spacing.sm, color: colors.mutedForeground },
            ]}
          >
            {'🎤'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messages: {
    flex: 1,
  },
  inputArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    padding: 0,
  },
  iconLarge: {
    fontSize: 24,
  },
  iconSmall: {
    fontSize: 20,
  },
});

export default ChatView;
