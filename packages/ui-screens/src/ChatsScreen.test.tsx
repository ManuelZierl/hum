import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ChatsScreen, type ChatsScreenProps } from './ChatsScreen';
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
    renderScreen();
    expect(screen.getByLabelText('Menu')).toBeInTheDocument();
    expect(screen.getByLabelText('Open camera')).toBeInTheDocument();
  });

  it('smoke presses actions', () => {
    const { getByLabelText } = renderScreen();
    fireEvent.click(getByLabelText('Menu'));
    fireEvent.click(getByLabelText('Open camera'));
    fireEvent.click(getByLabelText('Add'));
  });
});
