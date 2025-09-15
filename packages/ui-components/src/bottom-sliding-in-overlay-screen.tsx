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
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const visible = isControlled ? controlledOpen : internalOpen;
  const translateY = useRef(new Animated.Value(windowHeight)).current;
  const currentValueRef = useRef(windowHeight);
  const gestureStartRef = useRef(0);
  const closingRef = useRef(false);
  const desiredSheetHeight = windowHeight * 0.9;
  const availableHeight = windowHeight - insets.top;
  const sheetHeight =
    availableHeight > 0
      ? Math.min(desiredSheetHeight, availableHeight)
      : desiredSheetHeight;
  const horizontalGutter = windowWidth > 0 ? windowWidth * 0.025 : 0;
  const leftInset = horizontalGutter + insets.left;
  const rightInset = horizontalGutter + insets.right;
  const dismissThreshold = Math.max(sheetHeight * 0.2, 64);

  const animateTo = useCallback(
    (toValue: number, onEnd?: () => void) => {
      translateY.stopAnimation();
      Animated.timing(translateY, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        currentValueRef.current = toValue;
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
    animateTo(windowHeight, () => {
      closingRef.current = false;
      if (!isControlled) setInternalOpen(false);
      onClose?.();
    });
  }, [animateTo, isControlled, onClose, windowHeight]);

  useImperativeHandle(ref, () => ({ open, close }), [open, close]);

  useEffect(() => {
    if (!visible) {
      closingRef.current = false;
      currentValueRef.current = windowHeight;
      translateY.setValue(windowHeight);
      return;
    }

    closingRef.current = false;
    gestureStartRef.current = windowHeight;
    currentValueRef.current = windowHeight;
    translateY.setValue(windowHeight);
    animateTo(0);
  }, [animateTo, translateY, visible, windowHeight]);

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
        onMoveShouldSetPanResponder: (_: any, gesture: any) =>
          gesture.dy > 3 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onMoveShouldSetPanResponderCapture: (_: any, gesture: any) =>
          gesture.dy > 3 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: () => {
          translateY.stopAnimation((value?: number) => {
            const numericValue =
              typeof value === 'number' ? value : currentValueRef.current;
            gestureStartRef.current = numericValue;
            currentValueRef.current = numericValue;
            closingRef.current = false;
          });
        },
        onPanResponderMove: (_: any, { dy }: any) => {
          const next = Math.min(
            windowHeight,
            Math.max(0, gestureStartRef.current + dy),
          );
          translateY.setValue(next);
          currentValueRef.current = next;
        },
        onPanResponderRelease: (_: any, { dy, vy }: any) => {
          const finalValue = Math.min(
            windowHeight,
            Math.max(0, gestureStartRef.current + dy),
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
    [animateTo, close, dismissThreshold, translateY, windowHeight],
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */

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
    </Modal>
  );
});

BottomSlidingInOverlayScreen.displayName = 'BottomSlidingInOverlayScreen';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
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
