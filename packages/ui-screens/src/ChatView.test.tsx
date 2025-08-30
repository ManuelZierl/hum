import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
const SafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
import { ChatView, type ChatViewProps } from './ChatView';
import { ThemeProvider } from '@hum/ui-components/theme/ThemeProvider';

type Scheme = 'light' | 'dark';

const baseProps: ChatViewProps = {
  chatName: 'Alice',
  chatAvatar: 'https://example.com/avatar.png',
  onBack: jest.fn(),
  messages: [
    { id: '1', text: 'Hello', time: '14:15', isOutgoing: true, isRead: true },
  ],
};

function renderChatView(
  scheme: Scheme = 'light',
  props?: Partial<ChatViewProps>,
) {
  return render(
    <SafeAreaProvider>
      <ThemeProvider forcedScheme={scheme}>
        <ChatView {...baseProps} {...props} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('ChatView Screen', () => {
  it('renders and matches snapshot', () => {
    const { asFragment } = renderChatView();
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onBack when back pressed', () => {
    const onBack = jest.fn();
    const { getByLabelText } = renderChatView('light', { onBack });
    fireEvent.click(getByLabelText('Go back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('allows typing in input', () => {
    const { getByLabelText } = renderChatView();
    const input = getByLabelText('Message input');
    fireEvent.change(input, { target: { value: 'Hi' } });
    expect((input as unknown as { value: string }).value).toBe('Hi');
  });

  it('applies theme colors', () => {
    const { getByLabelText, rerender } = renderChatView('light');
    expect(getByLabelText('Outgoing message')).toHaveStyle({
      backgroundColor: 'rgba(254,202,26,1.00)',
    });
    rerender(
      <SafeAreaProvider>
        <ThemeProvider forcedScheme="dark">
          <ChatView {...baseProps} />
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    expect(getByLabelText('Outgoing message')).toHaveStyle({
      backgroundColor: 'rgba(254,202,26,1.00)',
    });
  });
});
