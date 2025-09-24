import type * as React from 'react';
import type { TextProps } from 'react-native';

declare module '@hum/rich-text' {
  export interface RichTextTheme {
    textColor: string;
    mutedColor: string;
    linkColor: string;
    headingColor: string;
    codeBackground: string;
    codeColor: string;
    blockquoteBorder: string;
  }

  export interface RenderOptions {
    theme: RichTextTheme;
    textStyle?: TextProps['style'];
    paragraphSpacing?: number;
    keyPrefix?: string;
  }

  export type SanitizedPayload = {
    sanitizedHtml: string;
    plainText: string;
  };

  export interface MatrixMessageContent {
    msgtype: 'm.text';
    body: string;
    format: 'org.matrix.custom.html';
    formatted_body: string;
  }

  export interface RichMessageInput {
    html: string;
    text?: string;
  }

  export function isSafeUrl(url: string): boolean;
  export function sanitizeRichTextHtml(input: string): string;
  export function stripHtmlTags(input: string): string;
  export function sanitizeRichContent(html: string, text?: string): SanitizedPayload;
  export function renderRichTextToNative(
    html: string,
    options: RenderOptions,
  ): React.ReactNode;
  export function createDefaultTheme(
    overrides?: Partial<RichTextTheme>,
  ): RichTextTheme;
  export function createMatrixMessageContent(
    input: RichMessageInput,
  ): MatrixMessageContent;

  export default sanitizeRichTextHtml;
}
