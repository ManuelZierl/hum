import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Text, Animated } from 'react-native';
import { BottomSlidingInOverlayScreen } from './bottom-sliding-in-overlay-screen';
import { ThemeProvider } from './theme/theme-provider';
// @ts-expect-error BackHandler not in react-native-web types
import { BackHandler } from 'react-native';
// @ts-expect-error PanResponder not in react-native-web types
import { PanResponder } from 'react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

let addEventListenerSpy: jest.SpyInstance;
let latestBackHandler: (() => boolean) | undefined;

beforeEach(() => {
  jest.useFakeTimers();
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
  jest.useRealTimers();
});

describe('BottomSlidingInOverlayScreen', () => {
  it('opens and closes via prop', () => {
    const onClose = jest.fn();
    const { getByText, queryByText, rerender } = render(
      <ThemeProvider forcedScheme="light">
        <BottomSlidingInOverlayScreen open onClose={onClose}>
          <Text>Content</Text>
        </BottomSlidingInOverlayScreen>
      </ThemeProvider>,
    );
    act(() => {
      jest.runAllTimers();
    });
    expect(getByText('Content')).toBeInTheDocument();
    rerender(
      <ThemeProvider forcedScheme="light">
        <BottomSlidingInOverlayScreen open={false} onClose={onClose}>
          <Text>Content</Text>
        </BottomSlidingInOverlayScreen>
      </ThemeProvider>,
    );
    act(() => {
      jest.runAllTimers();
    });
    expect(onClose).toHaveBeenCalled();
    expect(queryByText('Content')).toBeNull();
  });

  it('backdrop press closes overlay', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ThemeProvider forcedScheme="light">
        <BottomSlidingInOverlayScreen open onClose={onClose}>
          <Text>Content</Text>
        </BottomSlidingInOverlayScreen>
      </ThemeProvider>,
    );
    act(() => {
      jest.runAllTimers();
    });
    fireEvent.click(getByTestId('overlay-backdrop'));
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
    act(() => {
      jest.runAllTimers();
    });
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

      act(() => {
        jest.runAllTimers();
      });

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
      expect(lastCall).toBeCloseTo(120, 1);
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

      act(() => {
        jest.runAllTimers();
      });

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

      act(() => {
        jest.runAllTimers();
      });

      expect(onClose).toHaveBeenCalled();
    } finally {
      panSpy.mockRestore();
    }
  });
});
