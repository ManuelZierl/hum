import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  AvatarImage,
  ChatInputBar,
  ContactInline,
  MessageBubble,
  type MessageBubbleProps,
  TopBar,
  useOverlay,
  useTheme,
} from '@hum/ui-components';
import { useTranslation } from 'react-i18next';
import RichInputScreen from './RichInputScreen';
import {
  createMatrixMessageContent,
  sanitizeRichTextHtml,
} from '@hum/rich-text';
import { useHumClient } from '../src/hum/HumClientProvider';

export interface ChatMessage extends MessageBubbleProps {
  id: string;
  formattedBody?: string;
}

export interface ChatScreenProps {
  roomId: string;
  chatName: string;
  chatAvatar: string;
  onBack: () => void;
  messages?: ChatMessage[];
  onMessagesUpdate?: (messages: ChatMessage[]) => void;
}

const escapeHtml = (input: string): string =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const ChatScreen: React.FC<ChatScreenProps> = ({
  roomId,
  chatName,
  chatAvatar,
  onBack,
  messages = [],
  onMessagesUpdate,
}) => {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { open, close } = useOverlay();
  const { sendMessage, getMessages } = useHumClient();
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [richDraft, setRichDraft] = useState<{
    html: string;
    text: string;
  } | null>(null);

  const handleSubmitRichInput = useCallback(
    async ({ html, text }: { html: string; text: string }) => {
      try {
        setIsSubmitting(true);
        setRichDraft({ html, text });
        setValue(text);
        const content = createMatrixMessageContent({ html, text });
        await sendMessage(roomId, content);
        setValue('');
        setRichDraft(null);
        const updated = await getMessages(roomId);
        onMessagesUpdate?.(updated);
      } catch (error) {
        console.warn('ChatScreen: failed to send rich message', error);
      } finally {
        setIsSubmitting(false);
        close();
      }
    },
    [close, getMessages, onMessagesUpdate, roomId, sendMessage],
  );

  const handleComposerChange = useCallback(
    ({ html, text }: { html: string; text: string }) => {
      setRichDraft({ html, text });
      setValue(text);
    },
    [],
  );

  const handleOpenRichInput = useCallback(() => {
    if (isSubmitting) return;
    const startingHtml = richDraft?.html
      ? sanitizeRichTextHtml(richDraft.html)
      : value
        ? `<p>${escapeHtml(value)}</p>`
        : '';
    const sanitizedInitial = sanitizeRichTextHtml(startingHtml);
    const initialHtml = sanitizedInitial || '<p></p>';
    open(
      <RichInputScreen
        initialHtml={initialHtml}
        onCancel={close}
        onSubmit={handleSubmitRichInput}
        onContentChange={handleComposerChange}
      />,
    );
  }, [
    close,
    handleComposerChange,
    handleSubmitRichInput,
    isSubmitting,
    open,
    richDraft?.html,
    value,
  ]);

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
          onRichInputPress={handleOpenRichInput}
          richInputAccessibilityLabel={t('labels.rich_text_editor')}
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
