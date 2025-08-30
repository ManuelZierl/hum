import React, { useState } from 'react';
/* eslint-disable @typescript-eslint/no-require-imports */
import type { ViewStyle, TextStyle } from 'react-native';

const {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ImageBackground,
} = require('react-native');
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useTheme,
  Avatar,
  AvatarImage,
  AvatarFallback,
  MessageBubble,
} from '@hum/ui-components';

interface ChatMessage {
  id: string;
  text: string;
  time: string;
  isOutgoing: boolean;
  isRead?: boolean;
}

export interface ChatViewProps {
  chatName: string;
  chatAvatar: string;
  onBack: () => void;
  messages?: ChatMessage[];
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
  {
    id: '5',
    text: 'A mobile app redesign for a client. Took us 3 months but finally done!',
    time: '14:22',
    isOutgoing: false,
  },
  {
    id: '6',
    text: 'Wow, that sounds like a lot of work! Congratulations on finishing it 🎉',
    time: '14:23',
    isOutgoing: true,
    isRead: true,
  },
  {
    id: '7',
    text: 'Thanks! It was challenging but really rewarding',
    time: '14:25',
    isOutgoing: false,
  },
  {
    id: '8',
    text: 'Want to grab coffee later to celebrate?',
    time: '14:27',
    isOutgoing: true,
    isRead: true,
  },
  {
    id: '9',
    text: 'That sounds perfect! What time works for you?',
    time: '14:28',
    isOutgoing: false,
  },
  {
    id: '10',
    text: 'How about 4 PM at the usual place?',
    time: '14:30',
    isOutgoing: true,
    isRead: true,
  },
  {
    id: '11',
    text: 'Perfect! The coffee shop near the park right?',
    time: '14:31',
    isOutgoing: false,
  },
  {
    id: '12',
    text: 'Yes exactly! See you there 😊',
    time: '14:32',
    isOutgoing: true,
    isRead: true,
  },
  {
    id: '13',
    text: 'Looking forward to it! Should I bring anything?',
    time: '14:35',
    isOutgoing: false,
  },
  {
    id: '14',
    text: 'Just yourself! But if you want, you could bring those photos you mentioned last week',
    time: '14:37',
    isOutgoing: true,
    isRead: true,
  },
  {
    id: '15',
    text: 'Oh yes! The ones from the hiking trip. I almost forgot',
    time: '14:38',
    isOutgoing: false,
  },
  {
    id: '16',
    text: 'Of course! I have them ready on my phone',
    time: '14:40',
    isOutgoing: true,
    isRead: true,
  },
  {
    id: '17',
    text: "Great! Can't wait to see them. That trail looked amazing in your stories",
    time: '14:42',
    isOutgoing: false,
  },
  {
    id: '18',
    text: 'It really was! The sunset from the peak was incredible',
    time: '14:44',
    isOutgoing: true,
    isRead: true,
  },
  {
    id: '19',
    text: 'I need to plan a hiking trip soon. Work has been so stressful lately',
    time: '14:46',
    isOutgoing: false,
  },
  {
    id: '20',
    text: 'We should definitely plan one together! I know some great trails nearby',
    time: '14:48',
    isOutgoing: true,
    isRead: true,
  },
  {
    id: '21',
    text: 'That would be amazing! I could really use some time in nature',
    time: '14:50',
    isOutgoing: false,
  },
  {
    id: '22',
    text: "Let's discuss it over coffee today. I have some ideas 🏔️",
    time: '14:52',
    isOutgoing: true,
    isRead: false,
  },
];

export const ChatView: React.FC<ChatViewProps> = ({
  chatName,
  chatAvatar,
  onBack,
  messages = mockMessages,
}) => {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');

  const backButtonStyle = React.useMemo<ViewStyle>(
    () => ({ marginRight: spacing.md }),
    [spacing],
  );
  const nameContainerStyle = React.useMemo<ViewStyle>(
    () => ({ marginLeft: spacing.md }),
    [spacing],
  );
  const headerIconStyle = React.useMemo<ViewStyle>(
    () => ({ marginLeft: spacing.lg }),
    [spacing],
  );
  const imageRepeatStyle = React.useMemo(() => ({ resizeMode: 'repeat' }), []);
  const scrollContentStyle = React.useMemo<ViewStyle>(
    () => ({ paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }),
    [spacing],
  );
  const inputWrapperStyle = React.useMemo<ViewStyle>(
    () => ({
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.muted,
      borderRadius: radius.xl,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.md,
    }),
    [colors.muted, radius.xl, spacing.lg, spacing.sm, spacing.md],
  );
  const textInputStyle = React.useMemo<TextStyle>(
    () => ({
      flex: 1,
      color: colors.foreground,
      fontSize: type.size.base,
      padding: 0,
    }),
    [colors.foreground, type.size.base],
  );
  const micStyle = React.useMemo<ViewStyle>(
    () => ({ marginLeft: spacing.md }),
    [spacing],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.md,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={backButtonStyle}
          >
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <Avatar size={40}>
            <AvatarImage source={{ uri: chatAvatar }} />
            <AvatarFallback>{chatName.charAt(0)}</AvatarFallback>
          </Avatar>
          <View style={nameContainerStyle}>
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
              style={{ fontSize: type.size.sm, color: colors.mutedForeground }}
            >
              online
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Ionicons
            name="videocam"
            size={24}
            color={colors.foreground}
            style={headerIconStyle}
          />
          <Ionicons
            name="call"
            size={24}
            color={colors.foreground}
            style={headerIconStyle}
          />
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={colors.foreground}
            style={headerIconStyle}
          />
        </View>
      </View>

      {/* Messages */}
      <ImageBackground
        source={{
          uri: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23666' fill-opacity='0.03'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E",
        }}
        style={styles.messages}
        imageStyle={imageRepeatStyle}
      >
        <ScrollView contentContainerStyle={scrollContentStyle}>
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
      </ImageBackground>

      {/* Input Area */}
      <View
        style={[
          styles.inputArea,
          {
            paddingBottom: insets.bottom + spacing.sm,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.inputRow}>
          <Ionicons name="add" size={24} color={colors.mutedForeground} />
          <View style={inputWrapperStyle}>
            <TextInput
              style={textInputStyle}
              placeholder="Type a message..."
              placeholderTextColor={colors.mutedForeground}
              value={text}
              onChangeText={setText}
              accessibilityLabel="Message input"
            />
            <Ionicons
              name="happy-outline"
              size={20}
              color={colors.mutedForeground}
            />
          </View>
          <Ionicons name="camera" size={24} color={colors.mutedForeground} />
          <Ionicons
            name="mic"
            size={24}
            color={colors.mutedForeground}
            style={micStyle}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messages: {
    flex: 1,
  },
  inputArea: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ChatView;
