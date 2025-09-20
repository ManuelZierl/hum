import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Button, TopBar, useTheme } from '@hum/ui-components';
import { useTranslation } from 'react-i18next';
import { stripHtmlTags } from '../src/rich-text';

type Selection = { start: number; end: number };

type ToolbarAction = {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
};

type SelectionChangeEvent = { nativeEvent: { selection: Selection } };

export interface RichInputScreenProps {
  initialHtml?: string;
  onCancel: () => void;
  onSubmit: (payload: { html: string; text: string }) => void;
}

export const RichInputScreen: React.FC<RichInputScreenProps> = ({
  initialHtml = '',
  onCancel,
  onSubmit,
}) => {
  const { colors, spacing, radius, type } = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = useState<string>(initialHtml);
  const [selection, setSelection] = useState<Selection>({
    start: initialHtml.length,
    end: initialHtml.length,
  });
  const selectionRef = useRef(selection);

  const updateSelection = useCallback((next: Selection) => {
    selectionRef.current = next;
    setSelection(next);
  }, []);

  const handleSelectionChange = useCallback(
    (event: SelectionChangeEvent) => {
      const next = event.nativeEvent.selection;
      updateSelection(next);
    },
    [updateSelection],
  );

  const wrapSelection = useCallback(
    (openTag: string, closeTag: string) => {
      setValue((current) => {
        const { start, end } = selectionRef.current;
        const safeStart = Math.max(0, Math.min(start, current.length));
        const safeEnd = Math.max(safeStart, Math.min(end, current.length));
        const before = current.slice(0, safeStart);
        const selected = current.slice(safeStart, safeEnd);
        const after = current.slice(safeEnd);
        const nextValue = `${before}${openTag}${selected}${closeTag}${after}`;
        const cursor =
          safeStart + openTag.length + selected.length + closeTag.length;
        const nextSelection = { start: cursor, end: cursor };
        updateSelection(nextSelection);
        return nextValue;
      });
    },
    [updateSelection],
  );

  const insertSnippet = useCallback(
    (snippet: string) => {
      setValue((current) => {
        const { start, end } = selectionRef.current;
        const safeStart = Math.max(0, Math.min(start, current.length));
        const safeEnd = Math.max(safeStart, Math.min(end, current.length));
        const before = current.slice(0, safeStart);
        const after = current.slice(safeEnd);
        const nextValue = `${before}${snippet}${after}`;
        const cursor = safeStart + snippet.length;
        const nextSelection = { start: cursor, end: cursor };
        updateSelection(nextSelection);
        return nextValue;
      });
    },
    [updateSelection],
  );

  const toolbarActions = useMemo<ToolbarAction[]>(() => {
    return [
      {
        label: 'B',
        onPress: () => wrapSelection('<strong>', '</strong>'),
        accessibilityLabel: t('labels.format_bold'),
      },
      {
        label: 'I',
        onPress: () => wrapSelection('<em>', '</em>'),
        accessibilityLabel: t('labels.format_italic'),
      },
      {
        label: 'U',
        onPress: () => wrapSelection('<u>', '</u>'),
        accessibilityLabel: t('labels.format_underline'),
      },
      {
        label: 'S',
        onPress: () => wrapSelection('<s>', '</s>'),
        accessibilityLabel: t('labels.format_strikethrough'),
      },
      {
        label: 'H1',
        onPress: () => wrapSelection('<h1>', '</h1>'),
        accessibilityLabel: t('labels.format_heading', { level: '1' }),
      },
      {
        label: 'H2',
        onPress: () => wrapSelection('<h2>', '</h2>'),
        accessibilityLabel: t('labels.format_heading', { level: '2' }),
      },
      {
        label: 'H3',
        onPress: () => wrapSelection('<h3>', '</h3>'),
        accessibilityLabel: t('labels.format_heading', { level: '3' }),
      },
      {
        label: '•',
        onPress: () => insertSnippet('<ul>\n  <li></li>\n</ul>'),
        accessibilityLabel: t('labels.format_bullet_list'),
      },
      {
        label: '1.',
        onPress: () => insertSnippet('<ol>\n  <li></li>\n</ol>'),
        accessibilityLabel: t('labels.format_numbered_list'),
      },
      {
        label: '❝',
        onPress: () => wrapSelection('<blockquote>', '</blockquote>'),
        accessibilityLabel: t('labels.format_blockquote'),
      },
      {
        label: '</>',
        onPress: () => wrapSelection('<code>', '</code>'),
        accessibilityLabel: t('labels.format_code'),
      },
      {
        label: '🔗',
        onPress: () => {
          setValue((current) => {
            const { start, end } = selectionRef.current;
            const safeStart = Math.max(0, Math.min(start, current.length));
            const safeEnd = Math.max(safeStart, Math.min(end, current.length));
            const before = current.slice(0, safeStart);
            const after = current.slice(safeEnd);
            const selected =
              current.slice(safeStart, safeEnd) ||
              t('labels.format_link_default');
            const href = 'https://';
            const nextValue = `${before}<a href="${href}">${selected}</a>${after}`;
            const cursor =
              safeStart +
              `<a href="${href}">`.length +
              selected.length +
              '</a>'.length;
            const nextSelection = { start: cursor, end: cursor };
            updateSelection(nextSelection);
            return nextValue;
          });
        },
        accessibilityLabel: t('labels.format_link'),
      },
    ];
  }, [insertSnippet, t, updateSelection, wrapSelection]);

  const handleSubmit = useCallback(() => {
    const html = value.trim();
    const text = stripHtmlTags(html).trim();
    onSubmit({ html, text });
  }, [onSubmit, value]);

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
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View
          style={[
            styles.toolbar,
            {
              borderColor: colors.border,
              backgroundColor: colors.muted,
              borderRadius: radius.lg,
              padding: spacing.sm,
            },
          ]}
        >
          {toolbarActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              size="sm"
              onPress={action.onPress}
              accessibilityLabel={action.accessibilityLabel}
              style={[styles.toolbarButton, { marginRight: spacing.xs }]}
              textStyle={{ fontSize: type.size.sm }}
            >
              {action.label}
            </Button>
          ))}
        </View>
        <TextInput
          multiline
          value={value}
          onChangeText={setValue}
          onSelectionChange={handleSelectionChange}
          selection={selection}
          style={[
            styles.editor,
            {
              borderColor: colors.border,
              color: colors.foreground,
              fontSize: type.size.base,
              borderRadius: radius.lg,
              padding: spacing.md,
            },
          ]}
          placeholder="<p>...</p>"
          placeholderTextColor={colors.mutedForeground}
          accessibilityLabel={t('labels.rich_text_editor')}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolbarButton: {
    minWidth: 44,
  },
  editor: {
    minHeight: 240,
    borderWidth: StyleSheet.hairlineWidth,
    textAlignVertical: 'top',
  },
});

export default RichInputScreen;
