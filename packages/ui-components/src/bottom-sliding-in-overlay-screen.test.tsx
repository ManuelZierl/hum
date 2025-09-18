import React, { createRef } from 'react';
import {
  render,
  fireEvent,
  act,
  renderHook,
  waitFor,
} from '@testing-library/react-native';
import { Text, Animated, View, Pressable } from 'react-native';
import * as RNNS from 'react-native';
import {
  BottomSlidingInOverlayScreen,
  OverlayProvider,
  useOverlay,
  type BottomSlidingInOverlayScreenHandle,
} from './bottom-sliding-in-overlay-screen';
import { ThemeProvider } from './theme/theme-provider';
// @ts-expect-error BackHandler not in react-native-web types
import { BackHandler } from 'react-native';
// @ts-expect-error PanResponder not in react-native-web types
import { PanResponder } from 'react-native';

const rnghCallbacks: {
  begin?: () => void;
  update?: (event: { translationY: number }) => void;
  end?: (event: { translationY: number; velocityY: number }) => void;
} = {};
let lastPanBuilder: {
  minDistance: jest.Mock;
  onBegin: jest.Mock;
  onUpdate: jest.Mock;
  onEnd: jest.Mock;
  runOnJS: jest.Mock;
} | null = null;

jest.mock('react-native-gesture-handler', () => {
  const builder = {
    minDistance: jest.fn().mockImplementation(() => builder),
    onBegin: jest.fn().mockImplementation((cb: () => void) => {
      rnghCallbacks.begin = cb;
      return builder;
    }),
    onUpdate: jest
      .fn()
      .mockImplementation((cb: (e: { translationY: number }) => void) => {
        rnghCallbacks.update = cb;
        return builder;
      }),
    onEnd: jest
      .fn()
      .mockImplementation(
        (cb: (e: { translationY: number; velocityY: number }) => void) => {
          rnghCallbacks.end = cb;
          return builder;
        },
      ),
    runOnJS: jest.fn().mockImplementation(() => builder),
  };
  lastPanBuilder = builder;
  return {
    Gesture: {
      Pan: () => builder,
    },
    GestureDetector: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

const mockImmediateTiming = () =>
  jest
    .spyOn(Animated, 'timing')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .mockImplementation((value: any, config: any) => ({
      start: (cb?: (result: { finished: boolean }) => void) => {
        value.setValue(config.toValue);
        cb?.({ finished: true });
        return { stop: jest.fn() };
      },
      stop: jest.fn(),
      reset: jest.fn(),
    }));

// Avoid Modal portal behavior by patching RN Modal to render children inline during this suite
const OriginalModal = RNNS.Modal;
const InlineModal: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
InlineModal.displayName = 'InlineModal';
beforeAll(() => {
  // Cast to satisfy type compatibility for tests
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  RNNS.Modal = InlineModal;
});
afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  RNNS.Modal = OriginalModal;
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
  rnghCallbacks.begin = undefined;
  rnghCallbacks.update = undefined;
  rnghCallbacks.end = undefined;
  if (lastPanBuilder) {
    lastPanBuilder.minDistance.mockClear();
    lastPanBuilder.onBegin.mockClear();
    lastPanBuilder.onUpdate.mockClear();
    lastPanBuilder.onEnd.mockClear();
    lastPanBuilder.runOnJS.mockClear();
  }
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

  it('supports imperative open and close', async () => {
    const timing = mockImmediateTiming();
    const originalRAF = global.requestAnimationFrame;
    const originalCancelRAF = global.cancelAnimationFrame;
    const cancelSpy = jest.fn();
    global.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 1 as unknown as number;
    };
    global.cancelAnimationFrame = cancelSpy;

    const onClose = jest.fn();
    const ref = createRef<BottomSlidingInOverlayScreenHandle>();

    const { UNSAFE_getAllByType } = render(
      <ThemeProvider forcedScheme="light">
        <BottomSlidingInOverlayScreen ref={ref} onClose={onClose}>
          <Text>Imperative</Text>
        </BottomSlidingInOverlayScreen>
      </ThemeProvider>,
    );

    const hasImperative = () => {
      try {
        const nodes = UNSAFE_getAllByType(Text);
        return nodes.some((n) => {
          const content = n.props?.children;
          const str = Array.isArray(content)
            ? content.join('')
            : String(content ?? '');
          return str.includes('Imperative');
        });
      } catch {
        return false;
      }
    };

    expect(hasImperative()).toBe(false);

    await act(async () => {
      ref.current?.open();
    });

    expect(hasImperative()).toBe(true);

    await act(async () => {
      ref.current?.close();
    });

    expect(onClose).toHaveBeenCalled();
    await waitFor(() => expect(hasImperative()).toBe(false));
    expect(cancelSpy).toHaveBeenCalled();

    timing.mockRestore();
    global.requestAnimationFrame = originalRAF;
    global.cancelAnimationFrame = originalCancelRAF;
  });

  it('animates back when drag is insufficient', () => {
    const handlers: Record<string, unknown> = {};
    const panSpy = jest
      .spyOn(PanResponder, 'create')
      .mockImplementation((config: Record<string, unknown>) => {
        Object.assign(handlers, config);
        return { panHandlers: config } as unknown as ReturnType<
          typeof PanResponder.create
        >;
      });
    const timing = mockImmediateTiming();
    const originalRAF = global.requestAnimationFrame;
    const originalCancelRAF = global.cancelAnimationFrame;
    global.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 1 as unknown as number;
    };
    global.cancelAnimationFrame = jest.fn();

    try {
      render(
        <ThemeProvider forcedScheme="light">
          <BottomSlidingInOverlayScreen open>
            <Text>Content</Text>
          </BottomSlidingInOverlayScreen>
        </ThemeProvider>,
      );

      const startShould = handlers.onStartShouldSetPanResponder as
        | ((event: unknown, gesture: { dx: number; dy: number }) => boolean)
        | undefined;
      const startCapture = handlers.onStartShouldSetPanResponderCapture as
        | ((event: unknown, gesture: { dx: number; dy: number }) => boolean)
        | undefined;
      const moveShould = handlers.onMoveShouldSetPanResponder as
        | ((event: unknown, gesture: { dx: number; dy: number }) => boolean)
        | undefined;
      const moveCapture = handlers.onMoveShouldSetPanResponderCapture as
        | ((event: unknown, gesture: { dx: number; dy: number }) => boolean)
        | undefined;
      const terminationRequest = handlers.onPanResponderTerminationRequest as
        | (() => boolean)
        | undefined;

      expect(startShould?.({}, { dx: 0, dy: 4 })).toBe(true);
      expect(startCapture?.({}, { dx: 1, dy: 4 })).toBe(true);
      expect(moveShould?.({}, { dx: 0, dy: 5 })).toBe(true);
      expect(moveCapture?.({}, { dx: 1, dy: 5 })).toBe(true);
      expect(terminationRequest?.()).toBe(false);

      timing.mockClear();

      act(() => {
        (
          handlers.onPanResponderGrant as
            | ((event: unknown, gesture: unknown) => void)
            | undefined
        )?.({}, {});
        (
          handlers.onPanResponderRelease as
            | ((event: unknown, gesture: { dy: number; vy: number }) => void)
            | undefined
        )?.({}, { dy: 10, vy: 0 });
      });

      const lastReleaseCall = timing.mock.calls.at(-1)?.[1] as
        | { toValue: number }
        | undefined;
      expect(lastReleaseCall?.toValue).toBe(0);

      act(() => {
        (
          handlers.onPanResponderTerminate as
            | ((event: unknown, gesture: unknown) => void)
            | undefined
        )?.({}, {});
      });

      const lastTerminateCall = timing.mock.calls.at(-1)?.[1] as
        | { toValue: number }
        | undefined;
      expect(lastTerminateCall?.toValue).toBe(0);
    } finally {
      panSpy.mockRestore();
      timing.mockRestore();
      global.requestAnimationFrame = originalRAF;
      global.cancelAnimationFrame = originalCancelRAF;
    }
  });

  it('prefers RNGH gestures when available outside test env', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const timing = mockImmediateTiming();
    const originalRAF = global.requestAnimationFrame;
    const originalCancelRAF = global.cancelAnimationFrame;
    global.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 1 as unknown as number;
    };
    global.cancelAnimationFrame = jest.fn();

    const onClose = jest.fn();

    try {
      render(
        <ThemeProvider forcedScheme="light">
          <BottomSlidingInOverlayScreen open onClose={onClose}>
            <Text>Gesture</Text>
          </BottomSlidingInOverlayScreen>
        </ThemeProvider>,
      );

      expect(lastPanBuilder?.minDistance).toHaveBeenCalledWith(3);
      expect(lastPanBuilder?.runOnJS).toHaveBeenCalledWith(true);

      act(() => {
        rnghCallbacks.begin?.();
        rnghCallbacks.update?.({ translationY: 120 });
        rnghCallbacks.end?.({ translationY: 250, velocityY: 900 });
      });

      expect(onClose).toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
      timing.mockRestore();
      global.requestAnimationFrame = originalRAF;
      global.cancelAnimationFrame = originalCancelRAF;
    }
  });

  it('OverlayProvider renders overlay content via context', async () => {
    const timing = mockImmediateTiming();
    const originalRAF = global.requestAnimationFrame;
    const originalCancelRAF = global.cancelAnimationFrame;
    const cancelSpy = jest.fn();
    global.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 1 as unknown as number;
    };
    global.cancelAnimationFrame = cancelSpy;

    const TestComponent = () => {
      const { open, close } = useOverlay();
      return (
        <>
          <Pressable
            testID="trigger-open"
            onPress={() => open(<Text testID="overlay-content">Hello</Text>)}
          >
            <Text>Open</Text>
          </Pressable>
          <Pressable testID="trigger-close" onPress={() => close()}>
            <Text>Close</Text>
          </Pressable>
        </>
      );
    };

    const { UNSAFE_getAllByType } = render(
      <ThemeProvider forcedScheme="light">
        <OverlayProvider>
          <TestComponent />
        </OverlayProvider>
      </ThemeProvider>,
    );

    const getPressables = () => UNSAFE_getAllByType(Pressable);
    const hasHello = () => {
      try {
        return UNSAFE_getAllByType(Text).some((node) => {
          const content = node.props?.children;
          const str = Array.isArray(content)
            ? content.join('')
            : String(content ?? '');
          return str.includes('Hello');
        });
      } catch {
        return false;
      }
    };

    expect(hasHello()).toBe(false);

    await act(async () => {
      fireEvent.press(getPressables()[0]);
    });

    await waitFor(() => expect(hasHello()).toBe(true));

    await act(async () => {
      fireEvent.press(getPressables()[1]);
    });

    await waitFor(() => expect(hasHello()).toBe(false));
    expect(cancelSpy).toHaveBeenCalled();

    timing.mockRestore();
    global.requestAnimationFrame = originalRAF;
    global.cancelAnimationFrame = originalCancelRAF;
  });

  it('throws when useOverlay is used without provider', () => {
    expect(() => renderHook(() => useOverlay())).toThrow(
      'useOverlay must be used within OverlayProvider',
    );
  });
});
