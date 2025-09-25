import React from 'react';
import { View } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { SlideTransition } from './slide-transition';

describe('SlideTransition', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const scenes = {
    list: <View testID="scene-list" />,
    detail: <View testID="scene-detail" />,
  } as const;

  it('renders the active scene without animating initially', () => {
    const screen = render(
      <SlideTransition
        activeKey="list"
        scenes={scenes}
        testID="transition"
        initialWidth={200}
      />,
    );

    const staticView = screen.UNSAFE_root.findAllByProps({
      testID: 'slide-transition-static',
    })[0];
    expect(staticView.props.children).toEqual(
      expect.objectContaining({
        props: expect.objectContaining({ testID: 'scene-list' }),
      }),
    );
  });

  it('keeps the previous scene visible while transitioning forward', () => {
    const screen = render(
      <SlideTransition
        activeKey="list"
        scenes={scenes}
        direction="forward"
        testID="transition"
        initialWidth={200}
      />,
    );

    screen.rerender(
      <SlideTransition
        activeKey="detail"
        scenes={scenes}
        direction="forward"
        testID="transition"
        initialWidth={200}
      />,
    );

    jest.runAllTimers();

    const findByScene = (id: string) =>
      screen.UNSAFE_root.findAllByProps({ testID: id });
    expect(findByScene('scene-list')).toHaveLength(0);
    expect(findByScene('scene-detail')).toHaveLength(1);
  });

  it('does not revert to the original scene before the animation finishes', () => {
    const screen = render(
      <SlideTransition
        activeKey="list"
        scenes={scenes}
        direction="forward"
        testID="transition"
        initialWidth={200}
      />,
    );

    screen.rerender(
      <SlideTransition
        activeKey="detail"
        scenes={scenes}
        direction="forward"
        testID="transition"
        initialWidth={200}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.queryByTestId('slide-transition-static')).toBeNull();

    act(() => {
      jest.runOnlyPendingTimers();
    });
  });

  it('keeps the previous scene visible while transitioning backward', () => {
    const screen = render(
      <SlideTransition
        activeKey="detail"
        scenes={scenes}
        direction="forward"
        testID="transition"
        initialWidth={160}
      />,
    );

    screen.rerender(
      <SlideTransition
        activeKey="list"
        scenes={scenes}
        direction="backward"
        testID="transition"
        initialWidth={160}
      />,
    );

    jest.runAllTimers();

    const findByScene = (id: string) =>
      screen.UNSAFE_root.findAllByProps({ testID: id });
    expect(findByScene('scene-detail')).toHaveLength(0);
    expect(findByScene('scene-list')).toHaveLength(1);
  });

  it('calls onSwipeBack when swiping from the right edge', () => {
    const onSwipeBack = jest.fn();

    const screen = render(
      <SlideTransition
        activeKey="detail"
        scenes={scenes}
        direction="forward"
        testID="transition"
        initialWidth={200}
        onSwipeBack={onSwipeBack}
      />,
    );

    const container = screen.getByTestId('transition');

    act(() => {
      container.props.onLayout?.({
        nativeEvent: { layout: { width: 200 } },
      });
    });

    const startEvent = {
      nativeEvent: {
        locationX: 196,
        locationY: 200,
        pageX: 196,
        pageY: 200,
      },
    } as any;

    const shouldCapture =
      container.props.onStartShouldSetResponder?.(startEvent) ?? false;
    expect(shouldCapture).toBe(true);

    act(() => {
      container.props.onResponderGrant?.(startEvent);
    });

    const moveEvent = {
      nativeEvent: {
        pageX: 150,
        pageY: 200,
      },
    } as any;

    act(() => {
      container.props.onResponderMove?.(moveEvent);
    });

    const releaseEvent = {
      nativeEvent: {
        pageX: 140,
        pageY: 200,
      },
    } as any;

    act(() => {
      container.props.onResponderRelease?.(releaseEvent);
    });

    expect(onSwipeBack).toHaveBeenCalledTimes(1);
  });
});
