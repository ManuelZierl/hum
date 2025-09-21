import React, { type ReactElement } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ChatScreen } from '../ChatScreen';

const openMock = jest.fn<(element: ReactElement) => void>();
const closeMock = jest.fn();
const sendMessageMock = jest.fn();
const getMessagesMock = jest.fn();

jest.mock('@hum/ui-components', () => ({
  __esModule: true,
  TopBar: ({ children }: { children?: React.ReactNode }) => (
    <View>{children}</View>
  ),
  Avatar: ({ children }: { children?: React.ReactNode }) => (
    <View>{children}</View>
  ),
  AvatarImage: () => <View />,
  ContactInline: () => <View />,
  MessageBubble: ({ text }: { text: string }) => <Text>{text}</Text>,
  ChatInputBar: ({
    value,
    onChangeText,
    onRichInputPress,
  }: {
    value: string;
    onChangeText: (text: string) => void;
    onRichInputPress?: () => void;
  }) => (
    <View>
      <Text testID="chat-input-value">{value}</Text>
      <TouchableOpacity
        testID="set-text"
        onPress={() => onChangeText('Typed text')}
      >
        <Text>Set</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="open-rich" onPress={onRichInputPress}>
        <Text>Rich</Text>
      </TouchableOpacity>
    </View>
  ),
  useOverlay: () => ({ open: openMock, close: closeMock }),
  useTheme: () => ({
    colors: {
      background: '#fff',
      border: '#000',
      muted: '#eee',
      card: '#fff',
      primary: '#111',
      mutedForeground: '#666',
    },
    spacing: { md: 8 },
    radius: { lg: 12 },
  }),
}));

jest.mock('../../src/hum/HumClientProvider', () => ({
  __esModule: true,
  useHumClient: () => ({
    sendMessage: sendMessageMock,
    getMessages: getMessagesMock,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('ChatScreen rich text integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    openMock.mockImplementation(() => {});
    getMessagesMock.mockResolvedValue([]);
    sendMessageMock.mockResolvedValue(undefined);
  });

  it('propagates rich composer changes back to the input', () => {
    let overlayElement: ReactElement | null = null;
    openMock.mockImplementationOnce((element: ReactElement) => {
      overlayElement = element;
    });

    const { getByTestId } = render(
      <ChatScreen
        roomId="!room:test"
        chatName="Test"
        chatAvatar=""
        onBack={jest.fn()}
      />,
    );

    fireEvent.press(getByTestId('set-text'));
    fireEvent.press(getByTestId('open-rich'));

    expect(overlayElement).not.toBeNull();
    overlayElement?.props.onContentChange({
      html: '<p>Bold</p>',
      text: 'Bold',
    });

    expect(getByTestId('chat-input-value').props.children).toBe('Bold');
  });

  it('sends sanitized rich content and resets state', async () => {
    let overlayElement: ReactElement | null = null;
    openMock.mockImplementationOnce((element: ReactElement) => {
      overlayElement = element;
    });

    const onMessagesUpdate = jest.fn();
    const { getByTestId } = render(
      <ChatScreen
        roomId="!room:test"
        chatName="Test"
        chatAvatar=""
        onBack={jest.fn()}
        onMessagesUpdate={onMessagesUpdate}
      />,
    );

    fireEvent.press(getByTestId('open-rich'));
    expect(overlayElement).not.toBeNull();

    await act(async () => {
      await overlayElement?.props.onSubmit({
        html: '<p>Hello<script>bad()</script></p>',
        text: 'Hello',
      });
    });

    expect(sendMessageMock).toHaveBeenCalledWith(
      '!room:test',
      expect.objectContaining({
        msgtype: 'm.text',
        body: 'Hello',
        formatted_body: '<p>Hello</p>',
      }),
    );
    expect(getMessagesMock).toHaveBeenCalledWith('!room:test');
    await waitFor(() => {
      expect(onMessagesUpdate).toHaveBeenCalledWith([]);
    });
    expect(closeMock).toHaveBeenCalled();
    expect(getByTestId('chat-input-value').props.children).toBe('');
  });
});
