import React, { useMemo } from 'react';
import { type StyleProp, TextStyle, View, type ViewStyle } from 'react-native';
import {
  createDefaultTheme,
  renderRichTextToNative,
  sanitizeRichTextHtml,
} from '@hum/rich-text';
import { useTheme } from './theme/theme-provider';

export interface RichTextViewProps {
  html: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  paragraphSpacing?: number;
  testID?: string;
}

export const RichTextView: React.FC<RichTextViewProps> = ({
  html,
  style,
  textStyle,
  paragraphSpacing = 8,
  testID,
}) => {
  const { colors, type } = useTheme();

  const theme = useMemo(
    () =>
      createDefaultTheme({
        textColor: colors.foreground,
        headingColor: colors.foreground,
        linkColor: colors.primary,
        codeBackground: colors.muted,
        codeColor: colors.foreground,
        blockquoteBorder: colors.border,
        mutedColor: colors.mutedForeground,
      }),
    [
      colors.border,
      colors.foreground,
      colors.muted,
      colors.mutedForeground,
      colors.primary,
    ],
  );

  const content = useMemo(() => {
    const sanitized = sanitizeRichTextHtml(html);
    return renderRichTextToNative(sanitized, {
      theme,
      textStyle: [
        { fontSize: type.size.base, lineHeight: type.lineHeight.relaxed },
        textStyle,
      ],
      paragraphSpacing,
    });
  }, [
    html,
    paragraphSpacing,
    textStyle,
    theme,
    type.lineHeight.relaxed,
    type.size.base,
  ]);

  return (
    <View testID={testID} style={style} pointerEvents="none">
      {content}
    </View>
  );
};

export default RichTextView;
