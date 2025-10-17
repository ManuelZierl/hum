import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar, useTheme } from '@hum/ui-components';
import { useTranslation } from 'react-i18next';
import type { EditorBridge } from '@10play/tentap-editor';
import {
  RichText,
  useEditorBridge,
  useBridgeState,
  Images,
} from '@10play/tentap-editor';
import {
  BoldBridge,
  ItalicBridge,
  UnderlineBridge,
  StrikeBridge,
  HeadingBridge,
  OrderedListBridge,
  BulletListBridge,
  ListItemBridge,
  BlockquoteBridge,
  CodeBridge,
  LinkBridge,
  HistoryBridge,
  CoreBridge,
  HardBreakBridge,
  PlaceholderBridge,
} from '@10play/tentap-editor';
import { sanitizeRichTextHtml } from '@hum/rich-text';

const BRIDGE_EXTENSIONS = [
  BoldBridge,
  ItalicBridge,
  UnderlineBridge,
  StrikeBridge,
  HeadingBridge,
  OrderedListBridge,
  BulletListBridge,
  BlockquoteBridge,
  CodeBridge,
  LinkBridge,
  HistoryBridge,
  ListItemBridge,
  HardBreakBridge,
  PlaceholderBridge,
  CoreBridge,
] as const;

type ToolbarButtonConfig = {
  key: string;
  icon: number;
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
};

const shouldDisableToggle = (
  canToggle: boolean | undefined,
  isActive: boolean,
) => !canToggle && !isActive;

export interface RichInputScreenProps {
  initialHtml?: string;
  onCancel: () => void;
  onSubmit: (payload: { html: string; text: string }) => void;
  onContentChange?: (payload: { html: string; text: string }) => void;
}

export const RichInputScreen: React.FC<RichInputScreenProps> = ({
  initialHtml = '',
  onCancel,
  onSubmit,
  onContentChange,
}) => {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const translate = useCallback(
    (
      key: string,
      fallback: string | ((options?: Record<string, string>) => string),
      options?: Record<string, string>,
    ) => {
      const result = t(key, options);
      if (result === key) {
        return typeof fallback === 'function' ? fallback(options) : fallback;
      }
      return result;
    },
    [t],
  );
  const sanitizedInitial = useMemo(
    () => sanitizeRichTextHtml(initialHtml || ''),
    [initialHtml],
  );
  const editorRef = useRef<EditorBridge | null>(null);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [pendingLink, setPendingLink] = useState('');
  const hasInitialisedContent = useRef(false);

  const fetchContent = useCallback(async () => {
    if (!editorRef.current) {
      return { html: '', text: '' };
    }

    const [html, text] = await Promise.all([
      editorRef.current.getHTML(),
      editorRef.current.getText(),
    ]);
    const sanitizedHtml = sanitizeRichTextHtml(html);
    const normalizedText = text.replace(/\r\n?/g, '\n');

    return { html: sanitizedHtml, text: normalizedText };
  }, []);

  const handleContentChange = useCallback(async () => {
    const payload = await fetchContent();
    if (!payload.html && !payload.text) {
      onContentChange?.({ html: '', text: '' });
      return;
    }

    onContentChange?.(payload);
  }, [fetchContent, onContentChange]);

  const editor = useEditorBridge({
    bridgeExtensions: BRIDGE_EXTENSIONS.slice(),
    initialContent: sanitizedInitial,
    dynamicHeight: true,
    avoidIosKeyboard: true,
    onChange: () => {
      void handleContentChange();
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const editorState = useBridgeState(editor);

  useEffect(() => {
    hasInitialisedContent.current = false;
  }, [sanitizedInitial]);

  useEffect(() => {
    if (!editorRef.current) return;
    const placeholder = translate(
      'placeholders.type_message',
      'Type a message...',
    );
    editorRef.current.setPlaceholder(placeholder);
    if (!hasInitialisedContent.current) {
      hasInitialisedContent.current = true;
      if (sanitizedInitial) {
        editorRef.current.setContent(sanitizedInitial);
      }
    }
    void handleContentChange();
  }, [editor, handleContentChange, sanitizedInitial, translate]);

  const restoreSelectionAndRun = useCallback(
    (run: () => void) => {
      const selection = editorState.selection;
      editor.focus();
      if (
        selection &&
        typeof selection.from === 'number' &&
        typeof selection.to === 'number'
      ) {
        editor.setSelection(selection.from, selection.to);
      }

      const scheduler =
        typeof requestAnimationFrame === 'function'
          ? requestAnimationFrame
          : (cb: () => void) => setTimeout(cb, 0);
      scheduler(() => {
        run();
        void handleContentChange();
      });
    },
    [editor, editorState.selection, handleContentChange],
  );

  const toolbarButtons: ToolbarButtonConfig[] = useMemo(() => {
    return [
      {
        key: 'bold',
        icon: Images.bold,
        label: translate('labels.format_bold', 'Bold'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleBold()),
        active: editorState.isBoldActive,
        disabled: shouldDisableToggle(
          editorState.canToggleBold,
          editorState.isBoldActive,
        ),
      },
      {
        key: 'italic',
        icon: Images.italic,
        label: translate('labels.format_italic', 'Italic'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleItalic()),
        active: editorState.isItalicActive,
        disabled: shouldDisableToggle(
          editorState.canToggleItalic,
          editorState.isItalicActive,
        ),
      },
      {
        key: 'underline',
        icon: Images.underline,
        label: translate('labels.format_underline', 'Underline'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleUnderline()),
        active: editorState.isUnderlineActive,
        disabled: shouldDisableToggle(
          editorState.canToggleUnderline,
          editorState.isUnderlineActive,
        ),
      },
      {
        key: 'strike',
        icon: Images.strikethrough,
        label: translate('labels.format_strikethrough', 'Strikethrough'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleStrike()),
        active: editorState.isStrikeActive,
        disabled: shouldDisableToggle(
          editorState.canToggleStrike,
          editorState.isStrikeActive,
        ),
      },
      {
        key: 'h1',
        icon: Images.h1,
        label: translate(
          'labels.format_heading',
          (options) => `Heading ${options?.level ?? ''}`,
          { level: '1' },
        ),
        onPress: () => restoreSelectionAndRun(() => editor.toggleHeading(1)),
        active: editorState.headingLevel === 1,
        disabled: shouldDisableToggle(
          editorState.canToggleHeading,
          editorState.headingLevel === 1,
        ),
      },
      {
        key: 'h2',
        icon: Images.h2,
        label: translate(
          'labels.format_heading',
          (options) => `Heading ${options?.level ?? ''}`,
          { level: '2' },
        ),
        onPress: () => restoreSelectionAndRun(() => editor.toggleHeading(2)),
        active: editorState.headingLevel === 2,
        disabled: shouldDisableToggle(
          editorState.canToggleHeading,
          editorState.headingLevel === 2,
        ),
      },
      {
        key: 'h3',
        icon: Images.h3,
        label: translate(
          'labels.format_heading',
          (options) => `Heading ${options?.level ?? ''}`,
          { level: '3' },
        ),
        onPress: () => restoreSelectionAndRun(() => editor.toggleHeading(3)),
        active: editorState.headingLevel === 3,
        disabled: shouldDisableToggle(
          editorState.canToggleHeading,
          editorState.headingLevel === 3,
        ),
      },
      {
        key: 'blockquote',
        icon: Images.quote,
        label: translate('labels.format_blockquote', 'Blockquote'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleBlockquote()),
        active: editorState.isBlockquoteActive,
        disabled: shouldDisableToggle(
          editorState.canToggleBlockquote,
          editorState.isBlockquoteActive,
        ),
      },
      {
        key: 'code',
        icon: Images.code,
        label: translate('labels.format_code', 'Code'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleCode()),
        active: editorState.isCodeActive,
        disabled: shouldDisableToggle(
          editorState.canToggleCode,
          editorState.isCodeActive,
        ),
      },
      {
        key: 'ordered',
        icon: Images.orderedList,
        label: translate('labels.format_numbered_list', 'Numbered list'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleOrderedList()),
        active: editorState.isOrderedListActive,
        disabled: shouldDisableToggle(
          editorState.canToggleOrderedList,
          editorState.isOrderedListActive,
        ),
      },
      {
        key: 'bullet',
        icon: Images.bulletList,
        label: translate('labels.format_bullet_list', 'Bulleted list'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleBulletList()),
        active: editorState.isBulletListActive,
        disabled: shouldDisableToggle(
          editorState.canToggleBulletList,
          editorState.isBulletListActive,
        ),
      },
      {
        key: 'link',
        icon: Images.link,
        label: translate('labels.format_link', 'Link'),
        onPress: () => {
          if (Platform.OS === 'android') {
            const { from, to } = editorState.selection;
            setTimeout(() => {
              editor.focus();
              editor.setSelection(from, to);
            }, 0);
          }
          setPendingLink(editorState.activeLink ?? '');
          setIsLinkMode(true);
        },
        active: editorState.isLinkActive,
        disabled: !editorState.isLinkActive && !editorState.canSetLink,
      },
      {
        key: 'undo',
        icon: Images.undo,
        label: translate('actions.undo', 'Undo'),
        onPress: () => restoreSelectionAndRun(() => editor.undo()),
        disabled: !editorState.canUndo,
      },
      {
        key: 'redo',
        icon: Images.redo,
        label: translate('actions.redo', 'Redo'),
        onPress: () => restoreSelectionAndRun(() => editor.redo()),
        disabled: !editorState.canRedo,
      },
    ];
  }, [editor, editorState, restoreSelectionAndRun, translate]);

  const handleSubmit = useCallback(async () => {
    if (!editorRef.current) return;
    const payload = await fetchContent();
    onSubmit(payload);
  }, [fetchContent, onSubmit]);

  const handleInsertLink = useCallback(
    (link: string) => {
      setIsLinkMode(false);
      const trimmed = link.trim();
      if (!trimmed) {
        editor.setLink('');
        editor.focus();
        return;
      }
      editor.focus();
      editor.setLink(trimmed);
      setTimeout(() => {
        void handleContentChange();
      }, 0);
    },
    [editor, handleContentChange],
  );

  const handleCancelLink = useCallback(() => {
    setIsLinkMode(false);
    editor.focus();
    setPendingLink('');
  }, [editor]);

  const doneLabel = translate('actions.done', 'Done');
  const doneSymbol = 'âœ“';
  const linkLabel = translate('labels.format_link', 'Link');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TopBar
        backButton
        onBackPress={onCancel}
        dense
        rightItems={[
          {
            type: 'text',
            label: doneSymbol,
            onPress: handleSubmit,
            a11yLabel: doneLabel,
          },
        ]}
      />
      <View
        style={[
          styles.content,
          {
            paddingHorizontal: spacing.md,
            paddingBottom: Math.max(insets.bottom, spacing.lg),
          },
        ]}
      >
        {isLinkMode ? (
          <View
            style={[
              styles.linkBar,
              {
                backgroundColor: colors.muted,
                borderColor: colors.border,
                borderRadius: radius.lg,
                marginBottom: spacing.md,
              },
            ]}
          >
            <Pressable
              accessibilityLabel={linkLabel}
              style={[styles.linkButton, { borderRightColor: colors.border }]}
              onPress={handleCancelLink}
            >
              <Image source={Images.link} style={styles.linkIcon} />
            </Pressable>
            <TextInput
              style={[styles.linkInput, { color: colors.foreground }]}
              placeholder="https://"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              value={pendingLink}
              onChangeText={setPendingLink}
              onSubmitEditing={() => handleInsertLink(pendingLink)}
              returnKeyType="done"
            />
            <Pressable
              style={[styles.linkDone, { borderLeftColor: colors.border }]}
              onPress={() => handleInsertLink(pendingLink)}
            >
              <Text style={[styles.linkDoneText, { color: colors.primary }]}>
                {doneLabel}
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[
              styles.toolbarContainer,
              {
                backgroundColor: colors.muted,
                borderColor: colors.border,
                borderRadius: radius.lg,
                marginBottom: spacing.md,
              },
            ]}
            contentContainerStyle={styles.toolbarContent}
          >
            {toolbarButtons.map((button) => (
              <Pressable
                key={button.key}
                style={({ pressed }: { pressed: boolean }) => [
                  styles.toolbarButton,
                  pressed && !button.disabled
                    ? { backgroundColor: colors.card }
                    : null,
                  button.active
                    ? { borderColor: colors.primary, borderWidth: 1 }
                    : null,
                  button.disabled ? styles.disabled : null,
                ]}
                android_ripple={{ color: colors.border }}
                accessibilityRole="button"
                accessibilityLabel={button.label}
                onPress={button.onPress}
                disabled={button.disabled}
                hitSlop={4}
              >
                <Image
                  source={button.icon}
                  style={[
                    styles.toolbarIcon,
                    button.active ? { tintColor: colors.primary } : null,
                    button.disabled ? styles.iconDisabled : null,
                  ]}
                />
              </Pressable>
            ))}
          </ScrollView>
        )}
        <View style={[styles.editorWrapper, { marginTop: spacing.md }]}>
          <RichText
            editor={editor}
            style={[
              styles.editor,
              {
                backgroundColor: colors.muted,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.md,
                color: colors.foreground,
              },
            ]}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  editorWrapper: {
    flex: 1,
  },
  editor: {
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 320,
    flex: 1,
  },
  toolbarContainer: {
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
    flexGrow: 0,
    overflow: 'hidden',
  },
  toolbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  toolbarIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  disabled: {
    opacity: 0.4,
  },
  iconDisabled: {
    opacity: 0.4,
  },
  linkBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  linkButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  linkIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  linkInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  linkDone: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  linkDoneText: {
    fontWeight: '600',
  },
});

export default RichInputScreen;
