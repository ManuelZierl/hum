import { sanitizeRichContent } from './sanitize';

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

export function createMatrixMessageContent({
  html,
  text,
}: RichMessageInput): MatrixMessageContent {
  const { sanitizedHtml, plainText } = sanitizeRichContent(html, text);
  return {
    msgtype: 'm.text',
    body: plainText,
    format: 'org.matrix.custom.html',
    formatted_body: sanitizedHtml,
  };
}
