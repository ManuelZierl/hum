import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import {
  View,
  // @ts-expect-error react-native-web lacks type exports
  ScrollView,
  Pressable,
  StyleSheet,
  ViewProps,
  PressableProps,
  StyleProp,
  ViewStyle,
  // @ts-expect-error react-native-web lacks type exports
  LayoutChangeEvent,
  // @ts-expect-error react-native-web lacks type exports
  NativeScrollEvent,
  // @ts-expect-error react-native-web lacks type exports
  NativeSyntheticEvent,
  Text,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from './theme/ThemeProvider';

export interface CarouselApi {
  scrollNext: () => void;
  scrollPrev: () => void;
  scrollTo: (index: number) => void;
  selectedIndex: number;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
}

export interface CarouselProps extends ViewProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
}

interface CarouselContextValue {
  orientation: 'horizontal' | 'vertical';
  scrollRef: React.RefObject<ScrollView | null>;
  size: { width: number; height: number };
  setSize: (w: number, h: number) => void;
  totalItems: number;
  setTotalItems: (n: number) => void;
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  scrollNext: () => void;
  scrollPrev: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

export const useCarousel = () => {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error('useCarousel must be used within Carousel');
  return ctx;
};

export const Carousel: React.FC<CarouselProps> = ({
  children,
  orientation = 'horizontal',
  setApi,
  style,
  ...props
}) => {
  const scrollRef = useRef<ScrollView | null>(null);
  const [size, setSizeState] = useState({ width: 0, height: 0 });
  const [totalItems, setTotalItems] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      if (orientation === 'horizontal') {
        scrollRef.current?.scrollTo?.({
          x: size.width * index,
          animated: true,
        });
      } else {
        scrollRef.current?.scrollTo?.({
          y: size.height * index,
          animated: true,
        });
      }
      setCurrentIndex(index);
    },
    [orientation, size.height, size.width],
  );

  const scrollNext = useCallback(() => {
    if (currentIndex < totalItems - 1) {
      scrollTo(currentIndex + 1);
    }
  }, [currentIndex, totalItems, scrollTo]);

  const scrollPrev = useCallback(() => {
    if (currentIndex > 0) {
      scrollTo(currentIndex - 1);
    }
  }, [currentIndex, scrollTo]);

  const api = React.useMemo<CarouselApi>(
    () => ({
      scrollNext,
      scrollPrev,
      scrollTo,
      selectedIndex: currentIndex,
      canScrollPrev: () => currentIndex > 0,
      canScrollNext: () => currentIndex < totalItems - 1,
    }),
    [scrollNext, scrollPrev, scrollTo, currentIndex, totalItems],
  );

  useEffect(() => {
    setApi?.(api);
  }, [api, setApi]);

  const setSize = useCallback((w: number, h: number) => {
    setSizeState({ width: w, height: h });
  }, []);

  return (
    <CarouselContext.Provider
      value={{
        orientation,
        scrollRef,
        size,
        setSize,
        totalItems,
        setTotalItems,
        currentIndex,
        setCurrentIndex,
        scrollNext,
        scrollPrev,
        canScrollPrev: currentIndex > 0,
        canScrollNext: currentIndex < totalItems - 1,
      }}
    >
      <View
        style={[styles.root, style]}
        accessibilityRole="adjustable"
        {...props}
      >
        {children}
      </View>
    </CarouselContext.Provider>
  );
};

export const CarouselContent: React.FC<ViewProps> = ({
  children,
  style,
  ...props
}) => {
  const { orientation, scrollRef, setSize, setTotalItems, setCurrentIndex } =
    useCarousel();

  useEffect(() => {
    setTotalItems(React.Children.count(children));
  }, [children, setTotalItems]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize(width, height);
  };

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset =
      orientation === 'horizontal'
        ? e.nativeEvent.contentOffset.x
        : e.nativeEvent.contentOffset.y;
    const measurement =
      orientation === 'horizontal'
        ? e.nativeEvent.layoutMeasurement.width
        : e.nativeEvent.layoutMeasurement.height;
    const index = measurement ? Math.round(offset / measurement) : 0;
    setCurrentIndex(index);
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal={orientation === 'horizontal'}
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      onLayout={handleLayout}
      onMomentumScrollEnd={handleMomentumEnd}
      contentContainerStyle={[
        orientation === 'horizontal' ? styles.horizontal : undefined,
        style,
      ]}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

export const CarouselItem: React.FC<ViewProps> = ({
  children,
  style,
  ...props
}) => {
  const { orientation, size } = useCarousel();
  const itemStyle =
    orientation === 'horizontal'
      ? { width: size.width }
      : { height: size.height };
  return (
    <View style={[itemStyle, style]} {...props}>
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </View>
  );
};

interface CarouselButtonProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
}

export const CarouselPrevious: React.FC<CarouselButtonProps> = ({
  style,
  onPress,
  ...props
}) => {
  const { colors, radius, spacing } = useTheme();
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  const position: ViewStyle =
    orientation === 'horizontal'
      ? { left: spacing.md, bottom: spacing.md }
      : { top: spacing.md, left: '50%', marginLeft: -16 };
  const icon = orientation === 'horizontal' ? '←' : '↑';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Previous slide"
      onPress={(e: GestureResponderEvent) => {
        scrollPrev();
        onPress?.(e);
      }}
      disabled={!canScrollPrev}
      style={[
        styles.navButton,
        {
          backgroundColor: colors.humPrimary,
          borderRadius: radius.md,
        },
        position,
        !canScrollPrev && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Text style={{ color: colors.humPrimaryForeground }}>{icon}</Text>
    </Pressable>
  );
};

export const CarouselNext: React.FC<CarouselButtonProps> = ({
  style,
  onPress,
  ...props
}) => {
  const { colors, radius, spacing } = useTheme();
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  const position: ViewStyle =
    orientation === 'horizontal'
      ? { right: spacing.md, bottom: spacing.md }
      : { bottom: spacing.md, left: '50%', marginLeft: -16 };
  const icon = orientation === 'horizontal' ? '→' : '↓';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Next slide"
      onPress={(e: GestureResponderEvent) => {
        scrollNext();
        onPress?.(e);
      }}
      disabled={!canScrollNext}
      style={[
        styles.navButton,
        {
          backgroundColor: colors.humPrimary,
          borderRadius: radius.md,
        },
        position,
        !canScrollNext && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Text style={{ color: colors.humPrimaryForeground }}>{icon}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: { position: 'relative', overflow: 'hidden' },
  horizontal: { flexDirection: 'row' },
  navButton: {
    position: 'absolute',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
});
export default Carousel;
