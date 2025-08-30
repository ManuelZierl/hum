/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
// Temporary workaround for missing Jest DOM matcher typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAny = expect as any;

import { Button, type ButtonProps } from './button';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';

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
    const { asFragment } = renderButton();
    expectAny(asFragment()).toMatchSnapshot();
  });

  it('handles variant and size styles', () => {
    renderButton('light', { variant: 'destructive', size: 'lg' });
    const button = screen.getByRole('button');
    expectAny(button).toHaveStyle({
      backgroundColor: colors.light.destructive,
      height: '40px',
    });
  });

  it('calls onPress and respects disabled', () => {
    const onPress = jest.fn();
    const { rerender } = renderButton('light', { onPress });
    fireEvent.click(screen.getByRole('button'));
    expectAny(onPress).toHaveBeenCalledTimes(1);

    rerender(
      <ThemeProvider forcedScheme="light">
        <Button onPress={onPress} disabled>
          Press me
        </Button>
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole('button'));
    expectAny(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies accessibility props', () => {
    renderButton('light', { testID: 'btn', accessibilityLabel: 'test button' });
    const button = screen.getByTestId('btn');
    expectAny(button).toHaveAttribute('aria-label', 'test button');
  });
});
