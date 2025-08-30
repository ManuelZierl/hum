/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Alert, AlertTitle, AlertDescription, type AlertProps } from './alert';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';
// Temporary workaround for missing Jest DOM matcher typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAny = expect as any;

function renderAlert(
  scheme: 'light' | 'dark' = 'light',
  props?: Partial<AlertProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <Alert testID="alert" {...props}>
        <AlertTitle testID="title">Title</AlertTitle>
        <AlertDescription testID="description">Description</AlertDescription>
      </Alert>
    </ThemeProvider>,
  );
}

describe('Alert', () => {
  it('renders default and matches snapshot', () => {
    const { baseElement } = renderAlert();
    expectAny(screen.getByTestId('title')).toBeInTheDocument();
    expectAny(baseElement).toMatchSnapshot();
  });

  it('supports destructive variant', () => {
    renderAlert('light', { variant: 'destructive' });
    expectAny(screen.getByTestId('title')).toHaveStyle({
      color: colors.light.destructive,
    });
  });

  it('calls onPress when provided', () => {
    const onPress = jest.fn();
    renderAlert('light', { onPress });
    fireEvent.click(screen.getByTestId('alert'));
    expectAny(onPress).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { unmount } = renderAlert('light');
    expectAny(screen.getByTestId('title')).toHaveStyle({
      color: colors.light.cardForeground,
    });
    unmount();
    renderAlert('dark');
    expectAny(screen.getByTestId('title')).toHaveStyle({
      color: colors.dark.cardForeground,
    });
  });
});
