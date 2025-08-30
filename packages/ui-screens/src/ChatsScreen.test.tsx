import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import { ChatsScreen, mockChats, type ChatsScreenProps } from './ChatsScreen';

function renderScreen(props?: Partial<ChatsScreenProps>) {
  return render(<ChatsScreen {...props} chats={props?.chats ?? mockChats} />);
}

describe('ChatsScreen', () => {
  it('renders and matches snapshot', () => {
    const { asFragment } = renderScreen();
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to chat when chat item pressed', () => {
    const onNavigateToChat = jest.fn();
    const { getByLabelText } = renderScreen({ onNavigateToChat });
    fireEvent.click(getByLabelText(`Chat with ${mockChats[0].name}`));
    expect(onNavigateToChat).toHaveBeenCalledWith(mockChats[0]);
  });

  it('toggles theme', () => {
    const { getByLabelText, getByText } = renderScreen();
    const button = getByLabelText('toggle theme');
    fireEvent.click(button);
    expect(getByText(/Toggle\s+Dark\s+Mode/)).toBeTruthy();
  });

  it('renders empty list', () => {
    const { queryByText } = renderScreen({ chats: [] });
    expect(queryByText(mockChats[0].name)).toBeNull();
  });
});
