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
  const { t } = useTranslation();
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
    editorRef.current.setPlaceholder(t('placeholders.type_message'));
    if (!hasInitialisedContent.current) {
      hasInitialisedContent.current = true;
      if (sanitizedInitial) {
        editorRef.current.setContent(sanitizedInitial);
      }
    }
    void handleContentChange();
  }, [editor, handleContentChange, sanitizedInitial, t]);

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
        label: t('labels.format_bold'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleBold()),
        active: editorState.isBoldActive,
        disabled: !editorState.canToggleBold,
      },
      {
        key: 'italic',
        icon: Images.italic,
        label: t('labels.format_italic'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleItalic()),
        active: editorState.isItalicActive,
        disabled: !editorState.canToggleItalic,
      },
      {
        key: 'underline',
        icon: Images.underline,
        label: t('labels.format_underline'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleUnderline()),
        active: editorState.isUnderlineActive,
        disabled: !editorState.canToggleUnderline,
      },
      {
        key: 'strike',
        icon: Images.strikethrough,
        label: t('labels.format_strikethrough'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleStrike()),
        active: editorState.isStrikeActive,
        disabled: !editorState.canToggleStrike,
      },
      {
        key: 'h1',
        icon: Images.h1,
        label: t('labels.format_heading', { level: '1' }),
        onPress: () => restoreSelectionAndRun(() => editor.toggleHeading(1)),
        active: editorState.headingLevel === 1,
        disabled: !editorState.canToggleHeading,
      },
      {
        key: 'h2',
        icon: Images.h2,
        label: t('labels.format_heading', { level: '2' }),
        onPress: () => restoreSelectionAndRun(() => editor.toggleHeading(2)),
        active: editorState.headingLevel === 2,
        disabled: !editorState.canToggleHeading,
      },
      {
        key: 'h3',
        icon: Images.h3,
        label: t('labels.format_heading', { level: '3' }),
        onPress: () => restoreSelectionAndRun(() => editor.toggleHeading(3)),
        active: editorState.headingLevel === 3,
        disabled: !editorState.canToggleHeading,
      },
      {
        key: 'blockquote',
        icon: Images.quote,
        label: t('labels.format_blockquote'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleBlockquote()),
        active: editorState.isBlockquoteActive,
        disabled: !editorState.canToggleBlockquote,
      },
      {
        key: 'code',
        icon: Images.code,
        label: t('labels.format_code'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleCode()),
        active: editorState.isCodeActive,
        disabled: !editorState.canToggleCode,
      },
      {
        key: 'ordered',
        icon: Images.orderedList,
        label: t('labels.format_numbered_list'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleOrderedList()),
        active: editorState.isOrderedListActive,
        disabled: !editorState.canToggleOrderedList,
      },
      {
        key: 'bullet',
        icon: Images.bulletList,
        label: t('labels.format_bullet_list'),
        onPress: () => restoreSelectionAndRun(() => editor.toggleBulletList()),
        active: editorState.isBulletListActive,
        disabled: !editorState.canToggleBulletList,
      },
      {
        key: 'link',
        icon: Images.link,
        label: t('labels.format_link'),
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
        label: t('actions.undo'),
        onPress: () => restoreSelectionAndRun(() => editor.undo()),
        disabled: !editorState.canUndo,
      },
      {
        key: 'redo',
        icon: Images.redo,
        label: t('actions.redo'),
        onPress: () => restoreSelectionAndRun(() => editor.redo()),
        disabled: !editorState.canRedo,
      },
    ];
  }, [editor, editorState, restoreSelectionAndRun, t]);

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

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingBottom: spacing.lg },
      ]}
    >
      <TopBar
        backButton
        onBackPress={onCancel}
        title={t('labels.rich_text_editor')}
        rightItems={[
          {
            type: 'text',
            label: t('actions.done'),
            onPress: handleSubmit,
            a11yLabel: t('actions.done'),
          },
        ]}
      />
      <View style={[styles.editorWrapper, { paddingHorizontal: spacing.md }]}>
        <RichText
          editor={editor}
          style={[
            styles.editor,
            {
              backgroundColor: colors.muted,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.md,
            },
          ]}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.toolbarContainer, { paddingBottom: spacing.md }]}
      >
        {isLinkMode ? (
          <View
            style={[
              styles.linkBar,
              {
                backgroundColor: colors.muted,
                borderColor: colors.border,
                borderRadius: radius.lg,
                marginHorizontal: spacing.md,
              },
            ]}
          >
            <Pressable
              accessibilityLabel={t('labels.format_link')}
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
                {t('actions.done')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: spacing.md }}
            contentContainerStyle={[
              styles.toolbar,
              {
                backgroundColor: colors.muted,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
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
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editorWrapper: {
    flex: 1,
    paddingTop: 12,
  },
  editor: {
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 320,
  },
  toolbarContainer: {
    paddingTop: 12,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
    flexGrow: 0,
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
