import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  /**
   * Called when the user performs a back swipe from the right edge.
   */
  onSwipeBack?: () => void;
}

const DEFAULT_DURATION = 220;
const SWIPE_EDGE_THRESHOLD = 32;
const SWIPE_ACTIVATION_DISTANCE = 6;
const SWIPE_TRIGGER_DISTANCE = 40;
type ResponderHandlers = Partial<
  Pick<
    React.ComponentProps<typeof View>,
    | 'onStartShouldSetResponder'
    | 'onStartShouldSetResponderCapture'
    | 'onResponderGrant'
    | 'onResponderMove'
    | 'onResponderRelease'
    | 'onResponderTerminate'
    | 'onResponderTerminationRequest'
  >
>;
const EMPTY_RESPONDER_HANDLERS: ResponderHandlers = {};

type ViewInstance = React.ComponentRef<typeof View>;
type MeasureInWindow = (
  callback: (x: number, y: number, width: number, height: number) => void,
) => void;

type LayoutEvent = {
  nativeEvent: {
    layout: {
      width: number;
    };
  };
};

type ResponderEvent = {
  nativeEvent: {
    locationX?: number;
    pageX: number;
    pageY: number;
  };
};

export function SlideTransition<K extends string>({
  activeKey,
  scenes,
  direction = 'forward',
  duration = DEFAULT_DURATION,
  style,
  testID,
  initialWidth = 0,
  onSwipeBack,
}: SlideTransitionProps<K>) {
  const animationProgress = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(initialWidth);
  const [containerWindowX, setContainerWindowX] = useState(0);
  const [displayedKey, setDisplayedKey] = useState<K>(activeKey);
  const [transitionKey, setTransitionKey] = useState<K | null>(null);
  const [activeDirection, setActiveDirection] =
    useState<SlideDirection>(direction);
  const containerRef = useRef<ViewInstance | null>(null);
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

  const handleLayout = (event: LayoutEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    if (width !== containerWidth) {
      setContainerWidth(width);
    }

    const node = containerRef.current as
      | (ViewInstance & { measureInWindow?: MeasureInWindow })
      | null;

    node?.measureInWindow?.((
      x: number,
      _y: number,
      measuredWidth: number,
      _height: number,
    ) => {
      const roundedWidth = Math.round(measuredWidth);
      if (roundedWidth && roundedWidth !== containerWidth) {
        setContainerWidth(roundedWidth);
      }

      const roundedX = Math.round(x);
      if (roundedX !== containerWindowX) {
        setContainerWindowX(roundedX);
      }
    });
  };

  const swipeStateRef = useRef({
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    active: false,
  });

  const setSwipeStart = useCallback((event: ResponderEvent) => {
    const state = swipeStateRef.current;
    const { pageX, pageY } = event.nativeEvent;
    state.startX = pageX;
    state.startY = pageY;
    state.dx = 0;
    state.dy = 0;
    state.active = false;
  }, []);

  const shouldActivateFromEvent = useCallback(
    (event: ResponderEvent) => {
      if (!onSwipeBack || transitionKey || containerWidth === 0) {
        return false;
      }

      const { pageX } = event.nativeEvent;
      const distanceFromRightEdge =
        containerWindowX + containerWidth - pageX;

      return distanceFromRightEdge <= SWIPE_EDGE_THRESHOLD;
    },
    [containerWidth, containerWindowX, onSwipeBack, transitionKey],
  );

  const handleStartShouldSetResponder = useCallback(
    (event: ResponderEvent) => {
      if (!shouldActivateFromEvent(event)) {
        return false;
      }

      setSwipeStart(event);
      return true;
    },
    [setSwipeStart, shouldActivateFromEvent],
  );

  const handleStartShouldSetResponderCapture = useCallback(
    (event: ResponderEvent) => {
      if (!shouldActivateFromEvent(event)) {
        return false;
      }

      setSwipeStart(event);
      return true;
    },
    [setSwipeStart, shouldActivateFromEvent],
  );

  const handleResponderMove = useCallback((event: ResponderEvent) => {
    const state = swipeStateRef.current;
    const { pageX, pageY } = event.nativeEvent;
    state.dx = pageX - state.startX;
    state.dy = pageY - state.startY;

    if (!state.active) {
      const movingLeft = state.dx < -SWIPE_ACTIVATION_DISTANCE;
      const horizontalDominant = Math.abs(state.dx) > Math.abs(state.dy);
      if (movingLeft && horizontalDominant) {
        state.active = true;
      }
    }
  }, []);

  const resetSwipeState = useCallback(() => {
    const state = swipeStateRef.current;
    state.active = false;
    state.dx = 0;
    state.dy = 0;
  }, []);

  const handleResponderRelease = useCallback(
    (event: ResponderEvent) => {
      if (!onSwipeBack || transitionKey || containerWidth === 0) {
        resetSwipeState();
        return;
      }

      const state = swipeStateRef.current;
      // Final movement figures include the release position.
      const { pageX, pageY } = event.nativeEvent;
      state.dx = pageX - state.startX;
      state.dy = pageY - state.startY;

      const movedFarEnough = state.dx < -SWIPE_TRIGGER_DISTANCE;
      const horizontalDominant = Math.abs(state.dx) > Math.abs(state.dy);

      if (state.active && movedFarEnough && horizontalDominant) {
        onSwipeBack();
      }

      resetSwipeState();
    },
    [containerWidth, onSwipeBack, resetSwipeState, transitionKey],
  );

  const handleResponderTerminate = useCallback(() => {
    resetSwipeState();
  }, [resetSwipeState]);

  const handleResponderGrant = useCallback((event: ResponderEvent) => {
    const state = swipeStateRef.current;
    const { pageX, pageY } = event.nativeEvent;
    state.startX = pageX;
    state.startY = pageY;
    state.dx = 0;
    state.dy = 0;
    state.active = false;
  }, []);

  const handleResponderTerminationRequest = useCallback(() => true, []);

  const responderHandlers = useMemo<ResponderHandlers>(() => {
    if (!onSwipeBack) {
      return EMPTY_RESPONDER_HANDLERS;
    }

    return {
      onStartShouldSetResponderCapture: handleStartShouldSetResponderCapture,
      onStartShouldSetResponder: handleStartShouldSetResponder,
      onResponderGrant: handleResponderGrant,
      onResponderMove: handleResponderMove,
      onResponderRelease: handleResponderRelease,
      onResponderTerminate: handleResponderTerminate,
      onResponderTerminationRequest: handleResponderTerminationRequest,
    };
  }, [
    handleResponderGrant,
    handleResponderMove,
    handleResponderRelease,
    handleResponderTerminate,
    handleResponderTerminationRequest,
    handleStartShouldSetResponderCapture,
    handleStartShouldSetResponder,
    onSwipeBack,
  ]);

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
      ref={containerRef}
      style={[styles.container, style]}
      onLayout={handleLayout}
      testID={testID}
      {...responderHandlers}
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
