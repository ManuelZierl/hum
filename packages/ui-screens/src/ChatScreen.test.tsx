import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@hum/ui-components/theme/theme-provider';
import { ChatScreen, type ChatScreenProps } from './ChatScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
const SafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;

const baseProps: ChatScreenProps = {
  chatName: 'Alice',
  chatAvatar: 'https://example.com/a.png',
  onBack: jest.fn(),
  messages: [
    { id: '1', text: 'Hello', time: '10:00', isOutgoing: true, isRead: true },
  ],
};

function renderScreen(props?: Partial<ChatScreenProps>) {
  return render(
    <SafeAreaProvider>
      <ThemeProvider forcedScheme="light">
        <ChatScreen {...baseProps} {...props} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('ChatScreen', () => {
  it('renders top bar items', () => {
    const { getByLabelText } = renderScreen();
    expect(getByLabelText('Go back')).toBeOnTheScreen();
    expect(getByLabelText('Video call')).toBeOnTheScreen();
  });

  it('dummy actions do not crash', () => {
    const { getByLabelText } = renderScreen();
    fireEvent.press(getByLabelText('Video call'));
    fireEvent.press(getByLabelText('Voice call'));
    fireEvent.press(getByLabelText('More options'));
  });
});
