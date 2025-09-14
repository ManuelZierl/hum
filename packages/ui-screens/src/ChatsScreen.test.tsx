import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-dom';
import { ChatsScreen, mockChats, type ChatsScreenProps } from './ChatsScreen';
import { ThemeProvider } from '@hum/ui-components';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

function renderScreen(props?: Partial<ChatsScreenProps>) {
  return render(
    <ThemeProvider forcedScheme="dark">
      <ChatsScreen {...props} chats={props?.chats ?? []} />
    </ThemeProvider>,
  );
}

describe('ChatsScreen', () => {
  it('renders top bar', () => {
    const { getByLabelText } = renderScreen();
    expect(getByLabelText('Menu')).toBeInTheDocument();
    expect(getByLabelText('Open camera')).toBeInTheDocument();
  });

  it('uses TopBar centered title', () => {
    const { getByText } = renderScreen();
    expect(getByText('Chats')).toBeTruthy();
  });

  it('smoke presses actions', () => {
    const { getByLabelText } = renderScreen();
    fireEvent.click(getByLabelText('Menu'));
    fireEvent.click(getByLabelText('Open camera'));
    fireEvent.click(getByLabelText('Add'));
  });
});
