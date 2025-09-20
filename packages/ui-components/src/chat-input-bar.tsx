import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from './theme/icon';
import { useTheme } from './theme/theme-provider';

export interface ChatInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  inputAccessibilityLabel?: string;
  onAttachmentPress?: () => void;
  onEmojiPress?: () => void;
  onCameraPress?: () => void;
  onMicPress?: () => void;
  attachmentAccessibilityLabel?: string;
  emojiAccessibilityLabel?: string;
  cameraAccessibilityLabel?: string;
  micAccessibilityLabel?: string;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  value,
  onChangeText,
  placeholder,
  inputAccessibilityLabel,
  onAttachmentPress,
  onEmojiPress,
  onCameraPress,
  onMicPress,
  attachmentAccessibilityLabel,
  emojiAccessibilityLabel,
  cameraAccessibilityLabel,
  micAccessibilityLabel,
}) => {
  const { colors, spacing, radius } = useTheme();
  const minInputHeight = spacing.lg * 2;
  const maxInputHeight = spacing.xl * 6;
  const [inputHeight, setInputHeight] = useState(minInputHeight);
  const [isScrollable, setIsScrollable] = useState(false);
  const themedStyles = useMemo(
    () => ({
      container: {
        borderTopColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      },
      attachmentButton: {
        marginRight: spacing.sm,
      },
      attachmentText: {
        color: colors.mutedForeground,
      },
      inputContainer: {
        backgroundColor: colors.muted,
        borderRadius: radius.xl,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        overflow: 'hidden' as const,
      },
      textInput: {
        color: colors.foreground,
        textAlignVertical: 'top' as const,
      },
      emojiButton: {
        marginLeft: spacing.xs,
      },
      actionButton: {
        marginLeft: spacing.sm,
      },
    }),
    [
      colors.border,
      colors.foreground,
      colors.muted,
      colors.mutedForeground,
      radius.xl,
      spacing.md,
      spacing.sm,
      spacing.xs,
    ],
  );

  const handleContentSizeChange = useCallback(
    (event: {
      nativeEvent: {
        contentSize: {
          height: number;
        };
      };
    }) => {
      const contentHeight = event.nativeEvent.contentSize.height;
      const clampedHeight = Math.min(
        Math.max(contentHeight, minInputHeight),
        maxInputHeight,
      );
      setInputHeight(clampedHeight);
      setIsScrollable(contentHeight > maxInputHeight);
    },
    [maxInputHeight, minInputHeight],
  );

  useEffect(() => {
    if (value.length === 0) {
      setInputHeight(minInputHeight);
      setIsScrollable(false);
    }
  }, [minInputHeight, value]);

  return (
    <View style={[styles.container, themedStyles.container]}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole={onAttachmentPress ? 'button' : undefined}
          accessibilityLabel={attachmentAccessibilityLabel}
          hitSlop={spacing.xs}
          onPress={onAttachmentPress}
          disabled={!onAttachmentPress}
          style={[
            themedStyles.attachmentButton,
            !onAttachmentPress && styles.disabledControl,
          ]}
        >
          <Text
            style={[
              themedStyles.attachmentText,
              {
                fontSize: type.size['2xl'],
                lineHeight: type.size['2xl'],
              },
              !onAttachmentPress && styles.disabledControl,
            ]}
          >
            {'+'}
          </Text>
        </Pressable>

        <View style={[styles.textInputContainer, themedStyles.inputContainer]}>
          <TextInput
            style={[
              styles.textInput,
              themedStyles.textInput,
              {
                minHeight: minInputHeight,
                maxHeight: maxInputHeight,
                height: inputHeight,
              },
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.mutedForeground}
            value={value}
            onChangeText={onChangeText}
            accessible
            accessibilityLabel={inputAccessibilityLabel}
            multiline
            onContentSizeChange={handleContentSizeChange}
            scrollEnabled={isScrollable}
            blurOnSubmit={false}
            testID="chat-input-bar-text-input"
          />
          <Pressable
            accessibilityRole={onEmojiPress ? 'button' : undefined}
            accessibilityLabel={emojiAccessibilityLabel}
            onPress={onEmojiPress}
            disabled={!onEmojiPress}
            hitSlop={spacing.xs}
            style={[
              themedStyles.emojiButton,
              !onEmojiPress && styles.disabledControl,
            ]}
          >
            <Icon name="emoji-smile" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole={onCameraPress ? 'button' : undefined}
          accessibilityLabel={cameraAccessibilityLabel}
          onPress={onCameraPress}
          disabled={!onCameraPress}
          hitSlop={spacing.xs}
          style={[
            themedStyles.actionButton,
            !onCameraPress && styles.disabledControl,
          ]}
        >
          <Icon name="camera" size={24} color={colors.mutedForeground} />
        </Pressable>
        <Pressable
          accessibilityRole={onMicPress ? 'button' : undefined}
          accessibilityLabel={micAccessibilityLabel}
          onPress={onMicPress}
          disabled={!onMicPress}
          hitSlop={spacing.xs}
          style={[
            themedStyles.actionButton,
            !onMicPress && styles.disabledControl,
          ]}
        >
          <Icon name="mic" size={24} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
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
  disabledControl: {
    opacity: 0.4,
  },
});
