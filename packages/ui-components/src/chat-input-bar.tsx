import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from './theme/icon';
import { useTheme } from './theme/theme-provider';

type ContentSizeChangeEvent = {
  nativeEvent: {
    contentSize?: {
      height?: number;
    };
  };
};

type LayoutEvent = {
  nativeEvent?: {
    layout?: {
      height?: number;
    };
  };
};

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
  const { colors, spacing, radius, type } = useTheme();

  const { themedStyles, minInputHeight, maxInputHeight } = useMemo(() => {
    const minHeight = type.lineHeight.relaxed + spacing.xs * 2;
    const maxHeight = minHeight * 4;
    return {
      minInputHeight: minHeight,
      maxInputHeight: maxHeight,
      themedStyles: {
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
        },
        textInput: {
          color: colors.foreground,
          fontSize: type.size.base,
          lineHeight: type.lineHeight.relaxed,
        },
        emojiButton: {
          marginLeft: spacing.xs,
        },
        actionButton: {
          marginLeft: spacing.sm,
        },
      },
    };
  }, [
    colors.border,
    colors.foreground,
    colors.muted,
    colors.mutedForeground,
    radius.xl,
    spacing.md,
    spacing.sm,
    spacing.xs,
    type.lineHeight.relaxed,
    type.size.base,
    type.size['2xl'],
  ]);

  const measurementText = useMemo(() => {
    if (!value) return ' ';
    return `${value}\u200B`;
  }, [value]);

  const [inputHeight, setInputHeight] = useState(minInputHeight);
  const [isScrollEnabled, setIsScrollEnabled] = useState(false);

  useEffect(() => {
    setInputHeight(minInputHeight);
    setIsScrollEnabled(false);
  }, [minInputHeight]);

  const applyMeasuredHeight = useCallback(
    (height: number | undefined) => {
      if (typeof height !== 'number' || Number.isNaN(height)) return;
      const rounded = Math.ceil(height);
      const clampedHeight = Math.min(
        Math.max(rounded, minInputHeight),
        maxInputHeight,
      );
      setInputHeight((current) =>
        current === clampedHeight ? current : clampedHeight,
      );
      setIsScrollEnabled(rounded > maxInputHeight);
    },
    [maxInputHeight, minInputHeight],
  );

  const handleContentSizeChange = useCallback(
    (event: ContentSizeChangeEvent) => {
      applyMeasuredHeight(event.nativeEvent?.contentSize?.height);
    },
    [applyMeasuredHeight],
  );

  const handleMeasureLayout = useCallback(
    (event: LayoutEvent) => {
      applyMeasuredHeight(event.nativeEvent?.layout?.height);
    },
    [applyMeasuredHeight],
  );

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
          <View style={styles.expandingArea}>
            <View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.hiddenMeasureWrapper}
            >
              <Text
                onLayout={handleMeasureLayout}
                style={[
                  styles.hiddenMeasureText,
                  themedStyles.textInput,
                  {
                    minHeight: minInputHeight,
                  },
                ]}
              >
                {measurementText}
              </Text>
            </View>

            <TextInput
              multiline
              onContentSizeChange={handleContentSizeChange}
              scrollEnabled={isScrollEnabled}
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
            />
          </View>
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
  expandingArea: {
    flex: 1,
    position: 'relative',
  },
  hiddenMeasureWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0,
  },
  hiddenMeasureText: {
    padding: 0,
    width: '100%',
  },
  textInput: {
    width: '100%',
    padding: 0,
    textAlignVertical: 'top',
  },
  disabledControl: {
    opacity: 0.4,
  },
});
