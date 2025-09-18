import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatsScreen, type ChatsScreenProps } from './ChatsScreen';
import { ThemeProvider, OverlayProvider } from '@hum/ui-components';
import * as RNNS from 'react-native';

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
      <OverlayProvider>
        <ChatsScreen {...props} chats={props?.chats ?? []} />
      </OverlayProvider>
    </ThemeProvider>,
  );
}

describe('ChatsScreen', () => {
  it('renders top bar', () => {
    const { getByLabelText } = renderScreen();
    expect(getByLabelText('Menu')).toBeOnTheScreen();
    expect(getByLabelText('Open camera')).toBeOnTheScreen();
  });

  it('smoke presses actions', () => {
    const { getByLabelText } = renderScreen();
    fireEvent.press(getByLabelText('Menu'));
    fireEvent.press(getByLabelText('Open camera'));
    fireEvent.press(getByLabelText('Add'));
  });
});
