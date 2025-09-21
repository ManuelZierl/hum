import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { RichInputScreen } from '../RichInputScreen';

type EditorMock = {
  toggleBold: jest.Mock;
  toggleItalic: jest.Mock;
  toggleUnderline: jest.Mock;
  toggleStrike: jest.Mock;
  toggleHeading: jest.Mock;
  toggleBlockquote: jest.Mock;
  toggleCode: jest.Mock;
  toggleOrderedList: jest.Mock;
  toggleBulletList: jest.Mock;
  setLink: jest.Mock;
  undo: jest.Mock;
  redo: jest.Mock;
  focus: jest.Mock;
  setPlaceholder: jest.Mock;
  setSelection: jest.Mock;
  setContent: jest.Mock;
  getHTML: jest.Mock;
  getText: jest.Mock;
};

const editorMock: EditorMock = {
  toggleBold: jest.fn(),
  toggleItalic: jest.fn(),
  toggleUnderline: jest.fn(),
  toggleStrike: jest.fn(),
  toggleHeading: jest.fn(),
  toggleBlockquote: jest.fn(),
  toggleCode: jest.fn(),
  toggleOrderedList: jest.fn(),
  toggleBulletList: jest.fn(),
  setLink: jest.fn(),
  undo: jest.fn(),
  redo: jest.fn(),
  focus: jest.fn(),
  setPlaceholder: jest.fn(),
  setSelection: jest.fn(),
  setContent: jest.fn(),
  getHTML: jest.fn(),
  getText: jest.fn(),
};

const bridgeStateMock = {
  isBoldActive: false,
  canToggleBold: true,
  isItalicActive: false,
  canToggleItalic: true,
  isUnderlineActive: false,
  canToggleUnderline: true,
  isStrikeActive: false,
  canToggleStrike: true,
  headingLevel: undefined,
  canToggleHeading: true,
  isBlockquoteActive: false,
  canToggleBlockquote: true,
  isCodeActive: false,
  canToggleCode: true,
  isOrderedListActive: false,
  canToggleOrderedList: true,
  isBulletListActive: false,
  canToggleBulletList: true,
  isLinkActive: false,
  canSetLink: true,
  canUndo: true,
  canRedo: true,
  selection: { from: 0, to: 0 },
  activeLink: undefined,
};

const translations: Record<string, string> = {
  'labels.format_bold': 'Bold',
  'labels.format_italic': 'Italic',
  'labels.format_underline': 'Underline',
  'labels.format_strikethrough': 'Strikethrough',
  'labels.format_heading': 'Heading {{level}}',
  'labels.format_blockquote': 'Blockquote',
  'labels.format_code': 'Code',
  'labels.format_numbered_list': 'Numbered list',
  'labels.format_bullet_list': 'Bulleted list',
  'labels.format_link': 'Link',
  'labels.rich_text_editor': 'Rich text editor',
  'actions.done': 'Done',
  'actions.undo': 'Undo',
  'actions.redo': 'Redo',
  'placeholders.type_message': 'Type a message...',
};

let capturedOnChange: (() => void) | undefined;

jest.mock('@hum/ui-components', () => ({
  __esModule: true,
  TopBar: ({
    rightItems,
  }: {
    rightItems?: Array<{
      onPress: () => void;
      label: string;
      a11yLabel?: string;
    }>;
  }) => (
    <View>
      {rightItems?.map((item, index) => (
        <TouchableOpacity
          key={index}
          accessibilityLabel={item.a11yLabel ?? item.label}
          onPress={item.onPress}
        >
          <Text>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  ),
  useTheme: () => ({
    colors: {
      background: '#fff',
      muted: '#f5f5f5',
      border: '#ddd',
      card: '#eee',
      primary: '#333',
      foreground: '#111',
      mutedForeground: '#999',
    },
    spacing: { md: 16, lg: 24 },
    radius: { lg: 12 },
  }),
}));

type EditorBridgeOptions = {
  onChange?: () => void;
};

jest.mock('@10play/tentap-editor', () => ({
  __esModule: true,
  RichText: ({ children }: { children?: React.ReactNode }) => (
    <View testID="rich-text">{children}</View>
  ),
  useEditorBridge: jest.fn((options?: EditorBridgeOptions) => {
    capturedOnChange = options?.onChange;
    return editorMock;
  }),
  useBridgeState: jest.fn(() => bridgeStateMock),
  Images: {
    bold: 1,
    italic: 2,
    underline: 3,
    strikethrough: 4,
    h1: 5,
    h2: 6,
    h3: 7,
    quote: 8,
    code: 9,
    orderedList: 10,
    bulletList: 11,
    link: 12,
    undo: 13,
    redo: 14,
  },
  BoldBridge: {},
  ItalicBridge: {},
  UnderlineBridge: {},
  StrikeBridge: {},
  HeadingBridge: {},
  OrderedListBridge: {},
  BulletListBridge: {},
  BlockquoteBridge: {},
  CodeBridge: {},
  LinkBridge: {},
  HistoryBridge: {},
  ListItemBridge: {},
  HardBreakBridge: {},
  PlaceholderBridge: {},
  CoreBridge: {},
}));

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      if (key === 'labels.format_heading' && options?.level) {
        return `Heading ${options.level}`;
      }
      return translations[key] ?? key;
    },
  }),
}));

describe('RichInputScreen', () => {
  const originalOS = Platform.OS;
  const originalRequestAnimationFrame = global.requestAnimationFrame;

  beforeAll(() => {
    const rafMock: typeof requestAnimationFrame = (
      cb: FrameRequestCallback,
    ) => {
      cb(0);
      return 0;
    };
    (
      globalThis as { requestAnimationFrame: typeof requestAnimationFrame }
    ).requestAnimationFrame = rafMock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
    capturedOnChange = undefined;
    editorMock.getHTML.mockResolvedValue('<p>Hello <strong>World</strong></p>');
    editorMock.getText.mockResolvedValue('Hello World');
    bridgeStateMock.selection = { from: 0, to: 0 };
  });

  afterAll(() => {
    Platform.OS = originalOS;
    if (originalRequestAnimationFrame) {
      global.requestAnimationFrame = originalRequestAnimationFrame;
    } else {
      delete (
        global as { requestAnimationFrame?: typeof requestAnimationFrame }
      ).requestAnimationFrame;
    }
  });

  it('emits sanitized payload on submit', async () => {
    const handleSubmit = jest.fn();
    const { getByText } = render(
      <RichInputScreen
        initialHtml="<p>Hi</p>"
        onCancel={jest.fn()}
        onSubmit={handleSubmit}
      />,
    );

    await act(async () => {
      await capturedOnChange?.();
    });

    fireEvent.press(getByText('Done'));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        html: '<p>Hello <strong>World</strong></p>',
        text: 'Hello World',
      });
    });
  });

  it('notifies parent about content changes', async () => {
    const handleChange = jest.fn();
    render(
      <RichInputScreen
        initialHtml="<p>Init</p>"
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
        onContentChange={handleChange}
      />,
    );

    await act(async () => {
      await capturedOnChange?.();
    });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith({
        html: '<p>Hello <strong>World</strong></p>',
        text: 'Hello World',
      });
    });
  });

  it('invokes formatting commands from the toolbar', () => {
    bridgeStateMock.selection = { from: 2, to: 4 };
    const { getByA11yLabel } = render(
      <RichInputScreen
        initialHtml=""
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    fireEvent.press(getByA11yLabel('Bold'));
    fireEvent.press(getByA11yLabel('Italic'));
    fireEvent.press(getByA11yLabel('Underline'));
    fireEvent.press(getByA11yLabel('Strikethrough'));
    fireEvent.press(getByA11yLabel('Heading 1'));
    fireEvent.press(getByA11yLabel('Blockquote'));
    fireEvent.press(getByA11yLabel('Code'));
    fireEvent.press(getByA11yLabel('Numbered list'));
    fireEvent.press(getByA11yLabel('Bulleted list'));
    fireEvent.press(getByA11yLabel('Undo'));
    fireEvent.press(getByA11yLabel('Redo'));

    expect(editorMock.toggleBold).toHaveBeenCalled();
    expect(editorMock.toggleItalic).toHaveBeenCalled();
    expect(editorMock.toggleUnderline).toHaveBeenCalled();
    expect(editorMock.toggleStrike).toHaveBeenCalled();
    expect(editorMock.toggleHeading).toHaveBeenCalledWith(1);
    expect(editorMock.toggleBlockquote).toHaveBeenCalled();
    expect(editorMock.toggleCode).toHaveBeenCalled();
    expect(editorMock.toggleOrderedList).toHaveBeenCalled();
    expect(editorMock.toggleBulletList).toHaveBeenCalled();
    expect(editorMock.undo).toHaveBeenCalled();
    expect(editorMock.redo).toHaveBeenCalled();
    expect(editorMock.focus).toHaveBeenCalled();
    expect(editorMock.setSelection).toHaveBeenCalledWith(2, 4);
  });

  it('opens link editor when link button is pressed', () => {
    const { getByA11yLabel, getByPlaceholderText } = render(
      <RichInputScreen
        initialHtml=""
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    fireEvent.press(getByA11yLabel('Link'));

    const input = getByPlaceholderText('https://');
    fireEvent.changeText(input, 'https://example.com');
    fireEvent(input, 'submitEditing');

    expect(editorMock.setLink).toHaveBeenCalledWith('https://example.com');
    expect(editorMock.focus).toHaveBeenCalled();
  });
});
