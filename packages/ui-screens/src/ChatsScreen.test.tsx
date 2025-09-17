import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { ChatsScreen, type ChatsScreenProps } from './ChatsScreen';
import { ThemeProvider, OverlayProvider } from '@hum/ui-components';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

function renderScreen(props?: Partial<ChatsScreenProps>) {
  return render(
    <ThemeProvider forcedScheme="dark">
      <OverlayProvider>
        <ChatsScreen {...props} chats={props?.chats ?? []} />
      </OverlayProvider>
    </ThemeProvider>,
  );
}

describe('ChatsScreen', () => {
  it('renders top bar', () => {
    renderScreen();
    expect(screen.getByLabelText('Menu')).toBeOnTheScreen();
    expect(screen.getByLabelText('Open camera')).toBeOnTheScreen();
  });

  it('smoke presses actions', () => {
    const { getByLabelText } = renderScreen();
    fireEvent.press(getByLabelText('Menu'));
    fireEvent.press(getByLabelText('Open camera'));
  });
});
