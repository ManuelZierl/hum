import React from 'react';
import {
  StyleSheet,
  Text,
  type TextProps,
  View,
  type ViewProps,
} from 'react-native';

type Node =
  | { type: 'text'; value: string }
  | {
      type: 'element';
      name: string;
      attrs: Record<string, string>;
      children: Node[];
    };

type ElementNode = Extract<Node, { type: 'element' }>;

const TAG_REGEX = /<\/?([a-z0-9]+)(\s+[^>]+)?>/gi;
const ATTR_REGEX = /(\w+)="([^"]*)"/g;

const SELF_CLOSING = new Set(['br']);

const INLINE_TAGS = new Set([
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'code',
  'a',
  'span',
  'del',
]);

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

const normalizeWhitespace = (input: string): string =>
  input.replace(/\s+/g, ' ');

const parseAttributes = (raw: string | undefined): Record<string, string> => {
  if (!raw) return {};
  const attrs: Record<string, string> = {};
  ATTR_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ATTR_REGEX.exec(raw)) !== null) {
    const [, key, value] = match;
    attrs[key.toLowerCase()] = value;
  }
  return attrs;
};

const parseHtml = (html: string): Node[] => {
  const root: Node = { type: 'element', name: 'root', attrs: {}, children: [] };
  const stack: Node[] = [root];
  TAG_REGEX.lastIndex = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const appendText = (text: string) => {
    if (!text) return;
    const parent = stack[stack.length - 1];
    if (parent.type !== 'element') return;
    parent.children.push({ type: 'text', value: text });
  };

  while ((match = TAG_REGEX.exec(html)) !== null) {
    const [tag, nameRaw, attrRaw] = match;
    const name = nameRaw.toLowerCase();
    const textBetween = html.slice(lastIndex, match.index);
    appendText(textBetween);
    lastIndex = TAG_REGEX.lastIndex;

    if (tag.startsWith('</')) {
      // closing tag
      for (let i = stack.length - 1; i >= 0; i -= 1) {
        const current = stack[i];
        if (current.type === 'element' && current.name === name) {
          stack.length = i;
          break;
        }
      }
      continue;
    }

    const element: Node = {
      type: 'element',
      name,
      attrs: parseAttributes(attrRaw),
      children: [],
    };

    const parent = stack[stack.length - 1];
    if (parent.type === 'element') {
      parent.children.push(element);
    }

    if (!SELF_CLOSING.has(name)) {
      stack.push(element);
    }
  }

  if (lastIndex < html.length) {
    appendText(html.slice(lastIndex));
  }

  if (root.type !== 'element') {
    return [];
  }

  return root.children;
};

const trimTextChildren = (nodes: Node[]): Node[] => {
  return nodes
    .map((node) => {
      if (node.type === 'text') {
        return { ...node, value: node.value.replace(/\s+/g, ' ') };
      }
      if (!node.children.length) return node;
      const trimmedChildren = trimTextChildren(node.children);
      return { ...node, children: trimmedChildren };
    })
    .filter((node) => {
      if (node.type === 'text') {
        return node.value.trim().length > 0;
      }
      if (node.name === 'br') {
        return true;
      }
      return node.children.length > 0 || INLINE_TAGS.has(node.name);
    });
};

const openLink = (href: string) => {
  if (!href) return;
  if (typeof window !== 'undefined' && typeof window.open === 'function') {
    window.open(href, '_blank');
  }
};

const renderInlineChildren = (
  children: Node[],
  options: RenderOptions,
  keyPrefix: string,
  inheritedStyle: TextProps['style'] = [],
): React.ReactNode => {
  const baseStyleArray = Array.isArray(inheritedStyle)
    ? inheritedStyle.filter(Boolean)
    : [inheritedStyle];
  return children.map((child, index) => {
    const key = `${keyPrefix}-inline-${index}`;
    if (child.type === 'text') {
      return normalizeWhitespace(child.value);
    }

    const childStyle: TextProps['style'] = [...baseStyleArray];
    if (child.name === 'strong' || child.name === 'b') {
      childStyle.push({ fontWeight: '700' });
    }
    if (child.name === 'em' || child.name === 'i') {
      childStyle.push({ fontStyle: 'italic' });
    }
    if (child.name === 'u') {
      childStyle.push({ textDecorationLine: 'underline' });
    }
    if (child.name === 's' || child.name === 'del') {
      childStyle.push({ textDecorationLine: 'line-through' });
    }
    if (child.name === 'code') {
      childStyle.push({
        fontFamily: 'monospace',
        backgroundColor: options.theme.codeBackground,
        color: options.theme.codeColor,
        paddingHorizontal: 2,
        borderRadius: 4,
      });
    }
    if (child.name === 'a') {
      childStyle.push({
        color: options.theme.linkColor,
        textDecorationLine: 'underline',
      });
      const href = child.attrs.href ?? '';
      return (
        <Text
          key={key}
          style={childStyle}
          suppressHighlighting
          onPress={() => openLink(href)}
        >
          {renderInlineChildren(
            child.children,
            options,
            `${key}-child`,
            childStyle,
          )}
        </Text>
      );
    }
    if (child.name === 'br') {
      return '\n';
    }

    return (
      <Text key={key} style={childStyle} suppressHighlighting>
        {renderInlineChildren(
          child.children,
          options,
          `${key}-child`,
          childStyle,
        )}
      </Text>
    );
  });
};

const renderList = (
  node: ElementNode,
  options: RenderOptions,
  keyPrefix: string,
  ordered: boolean,
): React.ReactElement<ViewProps> => {
  const items = node.children.filter(
    (child): child is ElementNode =>
      child.type === 'element' && child.name === 'li',
  );

  return (
    <View
      key={`${keyPrefix}-list`}
      style={[
        styles.listContainer,
        { marginBottom: options.paragraphSpacing ?? 8 },
      ]}
    >
      {items.map((item, index) => (
        <View
          key={`${keyPrefix}-item-${index}`}
          style={[
            styles.listRow,
            index === items.length - 1 ? styles.listRowLast : null,
          ]}
        >
          <Text
            style={[styles.listBullet, { color: options.theme.mutedColor }]}
          >
            {ordered ? `${index + 1}.` : '\u2022'}
          </Text>
          <Text
            style={[
              styles.listText,
              { color: options.theme.textColor },
              options.textStyle,
            ]}
          >
            {renderInlineChildren(
              item.children,
              options,
              `${keyPrefix}-item-${index}`,
            )}
          </Text>
        </View>
      ))}
    </View>
  );
};

const renderBlock = (
  node: Node,
  options: RenderOptions,
  keyPrefix: string,
): React.ReactNode => {
  if (node.type === 'text') {
    const text = normalizeWhitespace(node.value);
    if (!text) return null;
    return (
      <Text
        key={`${keyPrefix}-text`}
        style={[{ color: options.theme.textColor }, options.textStyle]}
      >
        {text}
      </Text>
    );
  }

  switch (node.name) {
    case 'p':
      return (
        <Text
          key={`${keyPrefix}-p`}
          style={[
            {
              color: options.theme.textColor,
              marginBottom: options.paragraphSpacing ?? 8,
            },
            options.textStyle,
          ]}
        >
          {renderInlineChildren(node.children, options, `${keyPrefix}-p`)}
        </Text>
      );
    case 'h1':
    case 'h2':
    case 'h3': {
      const size = node.name === 'h1' ? 24 : node.name === 'h2' ? 20 : 18;
      return (
        <Text
          key={`${keyPrefix}-${node.name}`}
          style={[
            styles.heading,
            {
              color: options.theme.headingColor,
              fontSize: size,
              marginBottom: options.paragraphSpacing ?? 8,
            },
            options.textStyle,
          ]}
        >
          {renderInlineChildren(
            node.children,
            options,
            `${keyPrefix}-${node.name}`,
          )}
        </Text>
      );
    }
    case 'blockquote':
      return (
        <View
          key={`${keyPrefix}-blockquote`}
          style={[
            styles.blockquote,
            {
              borderLeftColor: options.theme.blockquoteBorder,
              marginBottom: options.paragraphSpacing ?? 8,
            },
          ]}
        >
          <Text style={[{ color: options.theme.textColor }, options.textStyle]}>
            {renderInlineChildren(
              node.children,
              options,
              `${keyPrefix}-blockquote`,
            )}
          </Text>
        </View>
      );
    case 'ul':
      return renderList(node as ElementNode, options, keyPrefix, false);
    case 'ol':
      return renderList(node as ElementNode, options, keyPrefix, true);
    case 'br':
      return (
        <Text
          key={`${keyPrefix}-br`}
          style={[{ color: options.theme.textColor }, options.textStyle]}
        >
          {'\n'}
        </Text>
      );
    default:
      if (INLINE_TAGS.has(node.name)) {
        return (
          <Text
            key={`${keyPrefix}-inline`}
            style={[{ color: options.theme.textColor }, options.textStyle]}
          >
            {renderInlineChildren([node], options, `${keyPrefix}-inline`)}
          </Text>
        );
      }
      return node.children.map((child, index) =>
        renderBlock(child, options, `${keyPrefix}-${node.name}-${index}`),
      );
  }
};

export const renderRichTextToNative = (
  html: string,
  options: RenderOptions,
): React.ReactNode => {
  const parsed = trimTextChildren(parseHtml(html));
  return parsed.map((node, index) =>
    renderBlock(node, options, `${options.keyPrefix ?? 'rich'}-${index}`),
  );
};

export const createDefaultTheme = (
  overrides?: Partial<RichTextTheme>,
): RichTextTheme => ({
  textColor: '#111827',
  mutedColor: '#6b7280',
  linkColor: '#2563eb',
  headingColor: '#111827',
  codeBackground: 'rgba(31,41,55,0.1)',
  codeColor: '#111827',
  blockquoteBorder: 'rgba(59,130,246,0.4)',
  ...overrides,
});

const styles = StyleSheet.create({
  listContainer: {
    marginBottom: 0,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listRowLast: {
    marginBottom: 0,
  },
  listBullet: {
    marginRight: 8,
  },
  listText: {
    flex: 1,
  },
  heading: {
    fontWeight: '700',
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: 12,
  },
});
