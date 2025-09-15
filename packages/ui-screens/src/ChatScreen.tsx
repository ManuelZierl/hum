import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  AvatarImage,
  useTheme,
  MessageBubble,
  type MessageBubbleProps,
  Icon,
  TopBar,
  ContactInline,
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
  const { colors, spacing, radius } = useTheme();
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
              placeholder={t('placeholders.type_message')}
              placeholderTextColor={colors.mutedForeground}
              value={value}
              onChangeText={setValue}
              accessible
              accessibilityLabel={t('labels.message_input')}
            />
            <Icon name="emoji-smile" size={20} color={colors.mutedForeground} />
          </View>
          <Icon
            name="camera"
            size={24}
            style={{ marginLeft: spacing.sm }}
            color={colors.mutedForeground}
          />
          <Icon
            name="mic"
            size={24}
            style={{ marginLeft: spacing.sm }}
            color={colors.mutedForeground}
          />
        </View>
      </View>
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
});

export default ChatScreen;
