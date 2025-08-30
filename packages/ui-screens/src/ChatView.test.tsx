import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@hum/ui-components';
import { ChatView, type ChatViewProps } from './ChatView';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: Record<string, unknown>) => <span {...props} />,
}));

describe('ChatView', () => {
  const baseProps: ChatViewProps = {
    chatName: 'Alice',
    chatAvatar: 'https://example.com/avatar.png',
    onBack: jest.fn(),
  };

  function renderScreen(overrides?: Partial<ChatViewProps>) {
    return render(
      <ThemeProvider forcedScheme="light">
        <ChatView {...baseProps} {...overrides} />
      </ThemeProvider>,
    );
  }

  it('renders messages and header', () => {
    renderScreen();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Hey! How are you doing?')).toBeInTheDocument();
  });

  it('triggers onBack when back button pressed', () => {
    const onBack = jest.fn();
    renderScreen({ onBack });
    fireEvent.click(screen.getByLabelText('Back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('updates input value', () => {
    renderScreen();
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input).toHaveValue('hello');
  });

  it('supports empty messages state', () => {
    renderScreen({ messages: [] });
    expect(screen.queryByText('Hey! How are you doing?')).toBeNull();
  });
});
