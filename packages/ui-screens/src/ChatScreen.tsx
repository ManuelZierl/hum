import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  AvatarImage,
  useTheme,
  MessageBubble,
  type MessageBubbleProps,
  TopBar,
  ContactInline,
  ChatInputBar,
} from '@hum/ui-components';
import { useTranslation } from 'react-i18next';

export interface ChatMessage extends MessageBubbleProps {
  id: string;
}

export interface ChatScreenProps {
  chatName: string;
  chatAvatar: string;
  onBack: () => void;
  messages?: ChatMessage[];
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  chatName,
  chatAvatar,
  onBack,
  messages = [],
}) => {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState('');
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingBottom: insets.bottom },
      ]}
    >
      <TopBar
        backButton
        onBackPress={onBack}
        leftItems={[
          {
            type: 'node',
            element: (
              <Avatar size={40}>
                <AvatarImage
                  source={{ uri: chatAvatar }}
                  accessibilityLabel={t('labels.avatar', { name: chatName })}
                />
              </Avatar>
            ),
          },
          { type: 'node', element: <ContactInline name={chatName} online /> },
        ]}
        rightItems={[
          {
            type: 'icon',
            name: 'camera-video',
            onPress: () => {},
            a11yLabel: t('actions.video_call'),
          },
          {
            type: 'icon',
            name: 'telephone',
            onPress: () => {},
            a11yLabel: t('actions.voice_call'),
          },
          {
            type: 'text',
            label: '⋮',
            onPress: () => {},
            a11yLabel: t('actions.more_options'),
          },
        ]}
      />

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

      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.bottom}
      >
        <ChatInputBar
          value={value}
          onChangeText={setValue}
          placeholder={t('placeholders.type_message')}
          inputAccessibilityLabel={t('labels.message_input')}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messages: {
    flex: 1,
  },
  keyboardAvoider: {
    flexShrink: 0,
  },
});

export default ChatScreen;
