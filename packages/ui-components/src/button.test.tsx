/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Pressable } from 'react-native';
import type { ReactTestRendererJSON } from 'react-test-renderer';
// Temporary workaround for missing Jest DOM matcher typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAny = expect as any;

import { Button, type ButtonProps } from './button';
import { ThemeProvider } from './theme/theme-provider';

type Scheme = 'light' | 'dark';

const childStyle = { backgroundColor: 'purple' } as const;

function renderButton(scheme: Scheme = 'light', props?: Partial<ButtonProps>) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <Button {...props}>Press me</Button>
    </ThemeProvider>,
  );
}

function getPressableStyles(props?: Partial<ButtonProps>) {
  const { UNSAFE_getByProps } = renderButton('light', props);
  const pressable = UNSAFE_getByProps({ accessibilityRole: 'button' });
  const styleFn = pressable.props.style as (state: {
    pressed: boolean;
  }) => (object | false | undefined)[];
  const notPressed = styleFn({ pressed: false });
  const pressed = styleFn({ pressed: true });
  const baseStyles = Array.isArray(notPressed[0])
    ? (notPressed[0] as (object | false | undefined)[])
    : [];
  const pressedStyle = pressed[pressed.length - 1];

  return { baseStyles, pressedStyle };
}

describe('Button', () => {
  it('renders and matches snapshot', () => {
    const { toJSON } = renderButton();
    expectAny(toJSON()).toMatchSnapshot();
  });

  it('handles variant and size styles', () => {
    const { toJSON } = renderButton('light', {
      variant: 'destructive',
      size: 'lg',
    });
    const tree = toJSON() as ReactTestRendererJSON | null;
    expectAny(tree?.props?.style).toMatchObject({
      backgroundColor: 'rgba(212,24,61,1.00)',
      height: '40px',
    });
  });

  it.each([
    [
      'destructive',
      { container: { backgroundColor: '#D4183D' }, pressed: { opacity: 0.9 } },
    ],
    [
      'outline',
      {
        container: {
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(0,0,0,0.10)',
          borderWidth: 1,
        },
        pressed: { backgroundColor: '#E9EBEF' },
      },
    ],
    [
      'secondary',
      {
        container: { backgroundColor: '#F2F2F6' },
        pressed: { opacity: 0.8 },
      },
    ],
    [
      'ghost',
      {
        container: { backgroundColor: 'transparent' },
        pressed: { backgroundColor: '#E9EBEF' },
      },
    ],
    [
      'link',
      {
        container: { backgroundColor: 'transparent' },
        pressed: { opacity: 0.8 },
      },
    ],
  ] as const)('applies variant styles for %s buttons', (variant, expected) => {
    const { baseStyles, pressedStyle } = getPressableStyles({ variant });
    expectAny(baseStyles).toEqual(
      expect.arrayContaining([
        expect.objectContaining(expected.container),
        expect.objectContaining({ opacity: 1 }),
      ]),
    );

    expectAny(pressedStyle).toEqual(expect.objectContaining(expected.pressed));
  });

  it.each([
    ['default', { height: 36, paddingHorizontal: 16, paddingVertical: 8 }],
    ['sm', { height: 32, paddingHorizontal: 12 }],
    ['lg', { height: 40, paddingHorizontal: 24 }],
    ['icon', { height: 36, width: 36 }],
  ] as const)('applies size styles for %s buttons', (size, expected) => {
    const { baseStyles } = getPressableStyles({ size });
    const sizeStyle = baseStyles.find(
      (style) => style && typeof style === 'object' && 'height' in style,
    ) as Record<string, unknown>;
    expectAny(sizeStyle).toEqual(expect.objectContaining(expected));
  });

  it('calls onPress and respects disabled', () => {
    const onPress = jest.fn();
    const { rerender, UNSAFE_getByProps } = renderButton('light', { onPress });
    const pressable = UNSAFE_getByProps({ accessibilityRole: 'button' });
    fireEvent.press(pressable);
    expectAny(onPress).toHaveBeenCalledTimes(1);

    rerender(
      <ThemeProvider forcedScheme="light">
        <Button onPress={onPress} disabled>
          Press me
        </Button>
      </ThemeProvider>,
    );
    const disabledPressable = UNSAFE_getByProps({
      accessibilityRole: 'button',
    });
    expectAny(disabledPressable.props.disabled).toBe(true);
  });

  it('applies accessibility props', () => {
    const { UNSAFE_getByProps } = renderButton('light', {
      testID: 'btn',
      accessibilityLabel: 'test button',
    });
    const button = UNSAFE_getByProps({ 'data-testid': 'btn' });
    expectAny(button.props['aria-label']).toBe('test button');
  });

  it('clones child elements when rendering asChild', () => {
    const { UNSAFE_getByProps } = render(
      <ThemeProvider forcedScheme="dark">
        <Button asChild accessibilityLabel="nested" disabled>
          <Pressable testID="nested" style={childStyle} />
        </Button>
      </ThemeProvider>,
    );

    const child = UNSAFE_getByProps({ testID: 'nested' });
    expectAny(child.props.disabled).toBe(true);
    expectAny(child.props.accessibilityLabel).toBe('nested');
    const [baseStyles, overrideStyle] = child.props.style as [
      (object | false | undefined)[],
      Record<string, unknown>,
    ];
    expectAny(baseStyles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: '#FECA1A' }),
        expect.objectContaining({ opacity: 0.5 }),
      ]),
    );
    expectAny(overrideStyle).toEqual(expect.objectContaining(childStyle));
  });
});
