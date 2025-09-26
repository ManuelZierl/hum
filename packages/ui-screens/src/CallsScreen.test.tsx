import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CallsScreen, mockCalls } from './CallsScreen';
import { ThemeProvider, OverlayProvider } from '@hum/ui-components';
import { Text } from 'react-native';
import * as RNNS from 'react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
// Avoid Modal portal behavior by patching RN Modal to render children inline during this suite
const OriginalModal = RNNS.Modal;
const InlineModal: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
InlineModal.displayName = 'InlineModal';
const originalConsoleError = console.error;
const consoleErrorSpy = jest
  .spyOn(console, 'error')
  .mockImplementation((...args) => {
    if (
      args.length > 0 &&
      typeof args[0] === 'string' &&
      args[0].includes('BackHandler is not supported on web')
    ) {
      return;
    }
    originalConsoleError(...args);
  });
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  RNNS.Modal = InlineModal;
});
afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  RNNS.Modal = OriginalModal;
  consoleErrorSpy.mockRestore();
  console.error = originalConsoleError;
});

function renderScreen(
  props?: Partial<React.ComponentProps<typeof CallsScreen>>,
) {
  return render(
    <ThemeProvider forcedScheme="dark">
      <OverlayProvider>
        <CallsScreen {...props} calls={props?.calls ?? mockCalls} />
      </OverlayProvider>
    </ThemeProvider>,
  );
}

describe('CallsScreen', () => {
  it('opens overlay on plus press', () => {
    const { getByLabelText, UNSAFE_getAllByType } = renderScreen();
    fireEvent.press(getByLabelText('Add call'));
    const texts = UNSAFE_getAllByType(Text);
    const hasNewCall = texts.some((t) => {
      const c = t?.props?.children;
      const s = Array.isArray(c) ? c.join('') : String(c ?? '');
      return s.includes('New Call');
    });
    expect(hasNewCall).toBe(true);
  });

  it('matches empty state snapshot', () => {
    const { toJSON } = renderScreen({ calls: [] });
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches populated snapshot', () => {
    const { toJSON } = renderScreen();
    expect(toJSON()).toMatchSnapshot();
  });
});
