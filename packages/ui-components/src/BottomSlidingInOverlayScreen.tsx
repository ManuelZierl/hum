import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
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
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const visible = isControlled ? controlledOpen : internalOpen;
  const translateY = useRef(new Animated.Value(1)).current;

  const open = useCallback(() => {
    if (!isControlled) setInternalOpen(true);
  }, [isControlled]);

  const close = useCallback(() => {
    if (!isControlled) setInternalOpen(false);
    onClose?.();
  }, [isControlled, onClose]);

  useImperativeHandle(ref, () => ({ open, close }), [open, close]);

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [visible, close]);

  useEffect(() => {
    if (!visible) {
      onClose?.();
    }
  }, [visible, onClose]);

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
        style={[
          styles.sheet,
          {
            backgroundColor: colors.background,
            paddingBottom: insets.bottom,
            transform: [
              {
                translateY: translateY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1000],
                }),
              },
            ],
          },
        ]}
      >
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
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '90%',
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
