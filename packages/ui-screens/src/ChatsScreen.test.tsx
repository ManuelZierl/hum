import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
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
    const { getByLabelText } = renderScreen();
    expect(getByLabelText('Menu')).toBeTruthy();
    expect(getByLabelText('Open camera')).toBeTruthy();
  });

  it('smoke presses actions', () => {
    const { getByLabelText } = renderScreen();
    fireEvent.press(getByLabelText('Menu'));
    fireEvent.press(getByLabelText('Open camera'));
    fireEvent.press(getByLabelText('Add'));
  });
});
