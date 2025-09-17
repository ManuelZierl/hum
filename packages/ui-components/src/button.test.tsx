/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { ReactTestRendererJSON } from 'react-test-renderer';
// Temporary workaround for missing Jest DOM matcher typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAny = expect as any;

import { Button, type ButtonProps } from './button';
import { ThemeProvider } from './theme/theme-provider';

type Scheme = 'light' | 'dark';

function renderButton(scheme: Scheme = 'light', props?: Partial<ButtonProps>) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <Button {...props}>Press me</Button>
    </ThemeProvider>,
  );
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
});
