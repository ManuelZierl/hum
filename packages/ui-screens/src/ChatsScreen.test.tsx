import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatsScreen, type ChatsScreenProps } from './ChatsScreen';
import * as UIComponents from '@hum/ui-components';
import { ThemeProvider } from '@hum/ui-components';
import * as RNNS from 'react-native';
import { TextInput } from 'react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Avoid Modal portal behavior that conflicts with react-test-renderer
// by patching RN Modal to render children inline during this test suite.
const OriginalModal = RNNS.Modal;
const InlineModal: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
InlineModal.displayName = 'InlineModal';
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  RNNS.Modal = InlineModal;
});
afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  RNNS.Modal = OriginalModal;
});

function renderScreen(props?: Partial<ChatsScreenProps>) {
  return render(
    <ThemeProvider forcedScheme="dark">
      <ChatsScreen {...props} chats={props?.chats ?? []} />
    </ThemeProvider>,
  );
}

describe('ChatsScreen', () => {
  let useOverlaySpy: jest.SpyInstance;

  beforeEach(() => {
    useOverlaySpy = jest
      .spyOn(UIComponents, 'useOverlay')
      .mockReturnValue({ open: jest.fn(), close: jest.fn() });
  });

  afterEach(() => {
    useOverlaySpy.mockRestore();
  });

  it('renders top bar', () => {
    const { getByLabelText } = renderScreen();
    expect(getByLabelText('Menu')).toBeOnTheScreen();
    expect(getByLabelText('Open camera')).toBeOnTheScreen();
    expect(getByLabelText('Add')).toBeOnTheScreen();
  });

  it('smoke presses actions', () => {
    const { getByLabelText } = renderScreen();
    fireEvent.press(getByLabelText('Menu'));
    fireEvent.press(getByLabelText('Open camera'));
    fireEvent.press(getByLabelText('Add'));
  });

  it('shows and updates the search input when enabled', () => {
    const { UNSAFE_getByType } = renderScreen({ showSearch: true });
    const searchInput = UNSAFE_getByType(TextInput);
    expect(searchInput.props.value).toBe('');
    fireEvent.changeText(searchInput, 'Boba Fett');
    expect(UNSAFE_getByType(TextInput).props.value).toBe('Boba Fett');
  });

  it('renders chats and navigates when a chat is pressed', () => {
    const onNavigate = jest.fn();
    const chat = {
      id: '1',
      name: 'Leia Organa',
      message: 'Help me, Obi-Wan Kenobi',
      time: '08:00',
      avatar: 'https://example.com/leia.png',
      unreadCount: 3,
    };
    const { getByLabelText } = renderScreen({
      onNavigateToChat: onNavigate,
      chats: [chat],
    });

    expect(getByLabelText('Archived')).toBeOnTheScreen();
    fireEvent.press(getByLabelText(`Chat with ${chat.name}`));
    expect(onNavigate).toHaveBeenCalledWith(chat);
  });

  it('opens the new chat overlay from the top bar action', () => {
    const open = jest.fn();
    const close = jest.fn();
    useOverlaySpy.mockReturnValue({
      open,
      close,
    });

    const { getByLabelText } = renderScreen({ chats: [] });

    fireEvent.press(getByLabelText('Add'));
    expect(open).toHaveBeenCalledTimes(1);
  });
});
