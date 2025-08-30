/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { Text, Pressable } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from './card';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';

// Temporary workaround for missing Jest matcher typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAny = expect as any;

function renderCard(scheme: 'light' | 'dark' = 'light', onAction?: () => void) {
  const onPress = onAction ?? jest.fn();
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <Card testID="card">
        <CardHeader>
          <CardTitle testID="title">Title</CardTitle>
          <CardDescription testID="description">Description</CardDescription>
          <CardAction>
            <Pressable
              onPress={onPress}
              accessibilityRole="button"
              testID="action"
            >
              <Text>Action</Text>
            </Pressable>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Text testID="content">Content</Text>
        </CardContent>
        <CardFooter>
          <Text testID="footer">Footer</Text>
        </CardFooter>
      </Card>
    </ThemeProvider>,
  );
}

describe('Card', () => {
  it('renders and matches snapshot', () => {
    const { baseElement } = renderCard();
    expectAny(screen.getByText('Title')).toBeInTheDocument();
    expectAny(baseElement).toMatchSnapshot();
  });

  it('handles action press', () => {
    const onPress = jest.fn();
    renderCard('light', onPress);
    fireEvent.click(screen.getByRole('button'));
    expectAny(onPress).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { unmount } = renderCard('light');
    expectAny(screen.getByText('Title')).toHaveStyle({
      color: colors.light.cardForeground,
    });
    unmount();
    renderCard('dark');
    expectAny(screen.getByText('Title')).toHaveStyle({
      color: colors.dark.cardForeground,
    });
  });

  it('provides accessibility role for action', () => {
    renderCard();
    const action = screen.getByRole('button');
    expectAny(action).toBeInTheDocument();
    expectAny(action).toHaveAttribute('data-testid', 'action');
  });
});
