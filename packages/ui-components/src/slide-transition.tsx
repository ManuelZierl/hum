import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type SlideDirection = 'forward' | 'backward';

export interface SlideTransitionProps<K extends string = string> {
  /**
   * Key of the currently active scene.
   */
  activeKey: K;
  /**
   * Scenes to render for each key. The component re-renders the corresponding
   * node whenever `scenes` changes, so the caller can pass freshly created
   * elements each render.
   */
  scenes: Record<K, React.ReactNode>;
  /**
   * Direction of the transition. `forward` slides the next scene from the
   * right, while `backward` slides it in from the left.
   */
  direction?: SlideDirection;
  /**
   * Duration of the slide animation in milliseconds.
   */
  duration?: number;
  style?: StyleProp<ViewStyle>;
  /**
   * Optional test identifier applied to the container.
   */
  testID?: string;
  /**
   * Optional initial width used before the first layout event. Useful for tests.
   */
  initialWidth?: number;
}

const DEFAULT_DURATION = 220;

export function SlideTransition<K extends string>({
  activeKey,
  scenes,
  direction = 'forward',
  duration = DEFAULT_DURATION,
  style,
  testID,
  initialWidth = 0,
}: SlideTransitionProps<K>) {
  const animationProgress = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(initialWidth);
  const [displayedKey, setDisplayedKey] = useState<K>(activeKey);
  const [transitionKey, setTransitionKey] = useState<K | null>(null);
  const [activeDirection, setActiveDirection] =
    useState<SlideDirection>(direction);
  const scenesRef = useRef(scenes);
  if (scenesRef.current !== scenes) {
    const mergedScenes: Record<K, React.ReactNode> = { ...scenesRef.current };
    (Object.keys(scenes) as K[]).forEach((key) => {
      const scene = scenes[key];
      if (scene !== null && scene !== undefined) {
        mergedScenes[key] = scene;
      }
    });
    scenesRef.current = mergedScenes;
  }

  useEffect(() => {
    if (activeKey === displayedKey) {
      return;
    }

    if (containerWidth === 0) {
      setDisplayedKey(activeKey);
      setTransitionKey(null);
      animationProgress.stopAnimation();
      return;
    }

    animationProgress.stopAnimation();
    animationProgress.setValue(0);
    setActiveDirection(direction);
    setTransitionKey(activeKey);

    const animation = Animated.timing(animationProgress, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    });

    animation.start(({ finished }: { finished?: boolean }) => {
      if (finished) {
        setDisplayedKey(activeKey);
        setTransitionKey(null);
        animationProgress.setValue(0);
      }
    });

    return () => {
      animation.stop();
    };
  }, [
    activeKey,
    direction,
    containerWidth,
    animationProgress,
    displayedKey,
    duration,
  ]);

  type LayoutEvent = {
    nativeEvent: {
      layout: {
        width: number;
      };
    };
  };

  const handleLayout = (event: LayoutEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    if (width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  const { currentScene, nextScene } = useMemo(() => {
    const currentScene = scenesRef.current[displayedKey];
    const nextScene = transitionKey ? scenesRef.current[transitionKey] : null;
    return { currentScene, nextScene };
  }, [displayedKey, transitionKey]);

  const { currentStyles, nextStyles } = useMemo(() => {
    if (!transitionKey || containerWidth === 0) {
      return {
        currentStyles: styles.absoluteFill,
        nextStyles: styles.absoluteFill,
      };
    }

    const offset = containerWidth;
    const forward = activeDirection === 'forward';

    const nextFrom = forward ? offset : -offset;
    const currentTo = forward ? -offset : offset;

    const nextTranslate = animationProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [nextFrom, 0],
    });

    const currentTranslate = animationProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, currentTo],
    });

    return {
      currentStyles: [
        styles.absoluteFill,
        { transform: [{ translateX: currentTranslate }] },
      ],
      nextStyles: [
        styles.absoluteFill,
        { transform: [{ translateX: nextTranslate }] },
      ],
    };
  }, [activeDirection, animationProgress, containerWidth, transitionKey]);

  return (
    <View
      style={[styles.container, style]}
      onLayout={handleLayout}
      testID={testID}
    >
      {transitionKey ? (
        <React.Fragment>
          <Animated.View
            testID="slide-transition-current"
            style={currentStyles}
          >
            {currentScene}
          </Animated.View>
          <Animated.View testID="slide-transition-next" style={nextStyles}>
            {nextScene}
          </Animated.View>
        </React.Fragment>
      ) : (
        <View testID="slide-transition-static" style={styles.absoluteFill}>
          {currentScene}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default SlideTransition;
