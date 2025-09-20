import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore BackHandler not in react-native-web types
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore PanResponder not in react-native-web types
  PanResponder,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore useWindowDimensions not in react-native-web types
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './theme/theme-provider';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const HIDDEN_EXTRA_OFFSET = 48;

export interface BottomSlidingInOverlayScreenProps {
  children?: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
}

export interface BottomSlidingInOverlayScreenHandle {
  open: () => void;
  close: () => void;
}

export const BottomSlidingInOverlayScreen = forwardRef<
  BottomSlidingInOverlayScreenHandle,
  BottomSlidingInOverlayScreenProps
>(({ children, open: controlledOpen, onClose }, ref) => {
  // Prefer react-native-gesture-handler in runtime, but fall back to PanResponder in tests
  type PanBuilder = {
    minDistance: (n: number) => PanBuilder;
    onBegin: (cb: () => void) => PanBuilder;
    onUpdate: (cb: (e: { translationY: number }) => void) => PanBuilder;
    onEnd: (
      cb: (e: { translationY: number; velocityY: number }) => void,
    ) => PanBuilder;
    runOnJS: (enable: boolean) => PanBuilder;
  };
  type RNGHLike = {
    Gesture: {
      Pan: () => PanBuilder;
    };
    GestureDetector: React.ComponentType<{
      gesture: unknown;
      children?: React.ReactNode;
    }>;
  };
  const rngh = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('react-native-gesture-handler') as unknown as RNGHLike;
    } catch {
      return null;
    }
  }, []);
  type GlobalWithNodeProcess = { process?: { env?: { NODE_ENV?: string } } };
  const gw = globalThis as GlobalWithNodeProcess;
  const isTestEnv = gw.process?.env?.NODE_ENV === 'test';
  const useRngh = !!rngh && !isTestEnv;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const visible = isControlled ? controlledOpen : internalOpen;

  const desiredSheetHeight = windowHeight > 0 ? windowHeight * 0.9 : 0;
  const availableHeight = windowHeight - insets.top;
  const constrainedSheetHeight =
    availableHeight > 0
      ? Math.min(desiredSheetHeight, availableHeight)
      : desiredSheetHeight;
  const sheetHeight =
    constrainedSheetHeight > 0
      ? constrainedSheetHeight
      : Math.max(desiredSheetHeight, 360);
  const hiddenOffset = sheetHeight + insets.bottom + HIDDEN_EXTRA_OFFSET;

  const horizontalGutter = windowWidth > 0 ? windowWidth * 0.025 : 0;
  const leftInset = horizontalGutter + insets.left;
  const rightInset = horizontalGutter + insets.right;
  const dismissThreshold = Math.max(sheetHeight * 0.25, 80);

  const translateYRef = useRef(new Animated.Value(hiddenOffset));
  const translateY = translateYRef.current;
  const currentValueRef = useRef(hiddenOffset);
  const gestureStartRef = useRef(hiddenOffset);
  const closingRef = useRef(false);

  const animateTo = useCallback(
    (toValue: number, onEnd?: () => void) => {
      translateY.stopAnimation();
      Animated.timing(translateY, {
        toValue,
        duration: 260,
        useNativeDriver: true,
      }).start(() => {
        currentValueRef.current = toValue;
        gestureStartRef.current = toValue;
        onEnd?.();
      });
    },
    [translateY],
  );

  const open = useCallback(() => {
    if (!isControlled) setInternalOpen(true);
  }, [isControlled]);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    animateTo(hiddenOffset, () => {
      closingRef.current = false;
      if (!isControlled) setInternalOpen(false);
      onClose?.();
    });
  }, [animateTo, hiddenOffset, isControlled, onClose]);

  useImperativeHandle(ref, () => ({ open, close }), [open, close]);

  useEffect(() => {
    if (visible) return;

    const hidden = hiddenOffset;
    closingRef.current = false;
    currentValueRef.current = hidden;
    gestureStartRef.current = hidden;
    translateY.setValue(hidden);
  }, [hiddenOffset, translateY, visible]);

  useEffect(() => {
    if (!visible) return;

    closingRef.current = false;
    translateY.setValue(hiddenOffset);
    currentValueRef.current = hiddenOffset;
    gestureStartRef.current = hiddenOffset;

    const frame = requestAnimationFrame(() => {
      animateTo(0);
    });

    return () => cancelAnimationFrame(frame);
  }, [visible, animateTo, hiddenOffset, translateY]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [visible, close]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (_: any, gesture: any) =>
          // Start capturing quickly if a vertical intent is detected
          Math.abs(gesture.dy) > 2 &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onStartShouldSetPanResponderCapture: (_: any, gesture: any) =>
          Math.abs(gesture.dy) > 2 &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onMoveShouldSetPanResponder: (_: any, gesture: any) =>
          gesture.dy > 3 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onMoveShouldSetPanResponderCapture: (_: any, gesture: any) =>
          gesture.dy > 3 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        // Don't allow another view to take over mid-gesture
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          translateY.stopAnimation((value?: number) => {
            const numericValue = clamp(
              typeof value === 'number' ? value : currentValueRef.current,
              0,
              hiddenOffset,
            );
            gestureStartRef.current = numericValue;
            currentValueRef.current = numericValue;
            closingRef.current = false;
          });
        },
        onPanResponderMove: (_: any, { dy }: any) => {
          const next = clamp(gestureStartRef.current + dy, 0, hiddenOffset);
          translateY.setValue(next);
          currentValueRef.current = next;
        },
        onPanResponderRelease: (_: any, { dy, vy }: any) => {
          const finalValue = clamp(
            gestureStartRef.current + dy,
            0,
            hiddenOffset,
          );
          currentValueRef.current = finalValue;

          if (finalValue > dismissThreshold || vy > 0.5) {
            close();
          } else {
            animateTo(0);
          }
        },
        onPanResponderTerminate: () => {
          animateTo(0);
        },
      }),
    [animateTo, close, dismissThreshold, hiddenOffset, translateY],
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // react-native-gesture-handler pan gesture (preferred on device)
  const panGesture = useMemo(() => {
    if (!useRngh || !rngh) return null;
    const Gesture = rngh.Gesture;
    return Gesture.Pan()
      .minDistance(3)
      .onBegin(() => {
        translateY.stopAnimation((value?: number) => {
          const numericValue = clamp(
            typeof value === 'number' ? value : currentValueRef.current,
            0,
            hiddenOffset,
          );
          gestureStartRef.current = numericValue;
          currentValueRef.current = numericValue;
          closingRef.current = false;
        });
      })
      .onUpdate((e: { translationY: number }) => {
        const next = clamp(
          gestureStartRef.current + e.translationY,
          0,
          hiddenOffset,
        );
        translateY.setValue(next);
        currentValueRef.current = next;
      })
      .onEnd((e: { translationY: number; velocityY: number }) => {
        const finalValue = clamp(
          gestureStartRef.current + e.translationY,
          0,
          hiddenOffset,
        );
        currentValueRef.current = finalValue;
        if (finalValue > dismissThreshold || e.velocityY > 800) {
          close();
        } else {
          animateTo(0);
        }
      })
      .runOnJS(true);
  }, [
    useRngh,
    rngh,
    translateY,
    hiddenOffset,
    dismissThreshold,
    close,
    animateTo,
  ]);

  useEffect(() => {
    if (isControlled && !visible) {
      onClose?.();
    }
  }, [isControlled, visible, onClose]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={close}
    >
      <Pressable
        testID="overlay-backdrop"
        style={styles.backdrop}
        onPress={close}
      />
      {useRngh ? (
        // Prefer RNGH on device for more reliable pan handling
        <rngh.GestureDetector gesture={panGesture}>
          <Animated.View
            testID="bottom-sliding-overlay"
            style={[
              styles.sheet,
              {
                backgroundColor: colors.background,
                paddingBottom: insets.bottom,
                height: sheetHeight,
                left: leftInset,
                right: rightInset,
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.handleContainer}>
              <View
                style={[styles.handle, { backgroundColor: colors.border }]}
              />
            </View>
            {children}
          </Animated.View>
        </rngh.GestureDetector>
      ) : (
        <Animated.View
          testID="bottom-sliding-overlay"
          {...panResponder.panHandlers}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom,
              height: sheetHeight,
              left: leftInset,
              right: rightInset,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handleContainer} {...panResponder.panHandlers}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>
          {children}
        </Animated.View>
      )}
    </Modal>
  );
});

BottomSlidingInOverlayScreen.displayName = 'BottomSlidingInOverlayScreen';

const styles = StyleSheet.create({
  backdrop: {
    // Ensure it fills the modal area reliably across platforms
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    // Make sure the sheet sits above the backdrop and receives gestures
    zIndex: 2,
    // Elevation for Android to guarantee it appears above
    elevation: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
  },
});

interface OverlayContextValue {
  open: (node: React.ReactNode) => void;
  close: () => void;
}

const OverlayContext = React.createContext<OverlayContextValue | undefined>(
  undefined,
);

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [open, setOpen] = useState(false);

  const openOverlay = useCallback((node: React.ReactNode) => {
    setContent(node);
    setOpen(true);
  }, []);

  const closeOverlay = useCallback(() => {
    setOpen(false);
    setContent(null);
  }, []);

  return (
    <OverlayContext.Provider value={{ open: openOverlay, close: closeOverlay }}>
      {children}
      <BottomSlidingInOverlayScreen open={open} onClose={closeOverlay}>
        {content}
      </BottomSlidingInOverlayScreen>
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  const ctx = React.useContext(OverlayContext);
  if (!ctx) {
    throw new Error('useOverlay must be used within OverlayProvider');
  }
  return ctx;
}

export default BottomSlidingInOverlayScreen;
