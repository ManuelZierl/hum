/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';

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
    const { asFragment } = renderButton();
    expect(asFragment()).toMatchSnapshot();
  });

  it('handles variant and size styles', () => {
    const { getByRole } = renderButton('light', {
      variant: 'destructive',
      size: 'lg',
    });
    const button = getByRole('button');
    expect(button).toHaveStyle({
      backgroundColor: 'rgb(212, 24, 61)',
      height: '40px',
    });
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = renderButton('light', { onPress });
    fireEvent.click(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies accessibility props', () => {
    const { getByRole } = renderButton('light', {
      accessibilityLabel: 'test button',
    });
    expect(getByRole('button', { name: 'test button' })).toBeInTheDocument();
  });

  it('reduces opacity when disabled', () => {
    const { getByRole } = renderButton('light', { disabled: true });
    expect(getByRole('button')).toHaveStyle({ opacity: '0.5' });
  });
});
