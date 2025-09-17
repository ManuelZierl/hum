import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Text, Animated, View } from 'react-native';
import { BottomSlidingInOverlayScreen } from './bottom-sliding-in-overlay-screen';
import { ThemeProvider } from './theme/theme-provider';
// @ts-expect-error BackHandler not in react-native-web types
import { BackHandler } from 'react-native';
// @ts-expect-error PanResponder not in react-native-web types
import { PanResponder } from 'react-native';

// Avoid Modal portal behavior by patching RN Modal to render children inline during this suite
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RN = require('react-native');
const OriginalModal = RN.Modal;
beforeAll(() => {
  RN.Modal = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
});
afterAll(() => {
  RN.Modal = OriginalModal;
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

let addEventListenerSpy: jest.SpyInstance;
let latestBackHandler: (() => boolean) | undefined;

beforeEach(() => {
  latestBackHandler = undefined;
  addEventListenerSpy = jest
    .spyOn(BackHandler, 'addEventListener')
    .mockImplementation((_: string, handler: () => boolean) => {
      latestBackHandler = handler;
      return { remove: jest.fn() } as unknown as ReturnType<
        typeof BackHandler.addEventListener
      >;
    });
});

afterEach(() => {
  addEventListenerSpy.mockRestore();
});

describe('BottomSlidingInOverlayScreen', () => {
  jest.setTimeout(15000);
  it('opens and closes via prop', () => {
    const onClose = jest.fn();
    const { UNSAFE_getAllByType, rerender } = render(
      <ThemeProvider forcedScheme="light">
        <BottomSlidingInOverlayScreen open onClose={onClose}>
          <Text>Content</Text>
        </BottomSlidingInOverlayScreen>
      </ThemeProvider>,
    );
    // No timers needed; controlled prop shows content synchronously
    const hasContent = UNSAFE_getAllByType(Text).some((n) => {
      const c = n?.props?.children;
      const s = Array.isArray(c) ? c.join('') : String(c ?? '');
      return s.includes('Content');
    });
    expect(hasContent).toBe(true);
    rerender(
      <ThemeProvider forcedScheme="light">
        <BottomSlidingInOverlayScreen open={false} onClose={onClose}>
          <Text>Content</Text>
        </BottomSlidingInOverlayScreen>
      </ThemeProvider>,
    );
    // No timers needed for controlled close
    expect(onClose).toHaveBeenCalled();
    let hasOverlay = false;
    try {
      const viewsAfter = UNSAFE_getAllByType(View);
      hasOverlay = viewsAfter.some(
        (v) => v.props?.testID === 'bottom-sliding-overlay',
      );
    } catch {
      hasOverlay = false;
    }
    expect(hasOverlay).toBe(false);
  });

  it('backdrop press closes overlay', () => {
    const onClose = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <ThemeProvider forcedScheme="light">
        <BottomSlidingInOverlayScreen open onClose={onClose}>
          <Text>Content</Text>
        </BottomSlidingInOverlayScreen>
      </ThemeProvider>,
    );
    // No timers needed; overlay is visible immediately
    const views = UNSAFE_getAllByType(View);
    const backdrop = views.find((v) => v.props?.testID === 'overlay-backdrop');
    expect(backdrop).toBeTruthy();
    fireEvent.press(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });

  it('hardware back closes overlay', () => {
    const onClose = jest.fn();
    render(
      <ThemeProvider forcedScheme="light">
        <BottomSlidingInOverlayScreen open onClose={onClose}>
          <Text>Content</Text>
        </BottomSlidingInOverlayScreen>
      </ThemeProvider>,
    );
    // No timers needed here
    latestBackHandler?.();
    expect(onClose).toHaveBeenCalled();
  });

  it('follows drag movement while open', () => {
    const setValueSpy = jest.spyOn(Animated.Value.prototype, 'setValue');
    const handlers: Record<string, unknown> = {};
    const panSpy = jest
      .spyOn(PanResponder, 'create')
      .mockImplementation((config: Record<string, unknown>) => {
        Object.assign(handlers, config);
        return { panHandlers: config } as unknown as ReturnType<
          typeof PanResponder.create
        >;
      });

    try {
      render(
        <ThemeProvider forcedScheme="light">
          <BottomSlidingInOverlayScreen open>
            <Text>Content</Text>
          </BottomSlidingInOverlayScreen>
        </ThemeProvider>,
      );

      // No timers needed here

      setValueSpy.mockClear();

      act(() => {
        (
          handlers.onPanResponderGrant as
            | ((event: unknown, gesture: unknown) => void)
            | undefined
        )?.({}, {});
        (
          handlers.onPanResponderMove as
            | ((event: unknown, gesture: { dy: number }) => void)
            | undefined
        )?.({}, { dy: 120 });
      });

      const lastCall = setValueSpy.mock.calls.at(-1)?.[0];
      expect(typeof lastCall).toBe('number');
      expect(lastCall).toBeGreaterThan(0);
    } finally {
      panSpy.mockRestore();
      setValueSpy.mockRestore();
    }
  });

  it('dismisses when dragged downward', () => {
    const onClose = jest.fn();
    const handlers: Record<string, unknown> = {};
    const panSpy = jest
      .spyOn(PanResponder, 'create')
      .mockImplementation((config: Record<string, unknown>) => {
        Object.assign(handlers, config);
        return { panHandlers: config } as unknown as ReturnType<
          typeof PanResponder.create
        >;
      });

    try {
      render(
        <ThemeProvider forcedScheme="light">
          <BottomSlidingInOverlayScreen open onClose={onClose}>
            <Text>Content</Text>
          </BottomSlidingInOverlayScreen>
        </ThemeProvider>,
      );

      // No timers needed here

      act(() => {
        (
          handlers.onPanResponderGrant as
            | ((event: unknown, gesture: unknown) => void)
            | undefined
        )?.({}, {});
        (
          handlers.onPanResponderMove as
            | ((event: unknown, gesture: { dy: number }) => void)
            | undefined
        )?.({}, { dy: 200 });
        (
          handlers.onPanResponderRelease as
            | ((event: unknown, gesture: { dy: number; vy: number }) => void)
            | undefined
        )?.(
          {},
          {
            dy: 220,
            vy: 0.6,
          },
        );
      });

      // No timers needed here

      expect(onClose).toHaveBeenCalled();
    } finally {
      panSpy.mockRestore();
    }
  });
});
