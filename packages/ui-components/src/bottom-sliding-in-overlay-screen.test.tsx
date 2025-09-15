import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Text } from 'react-native';
import { BottomSlidingInOverlayScreen } from './bottom-sliding-in-overlay-screen';
import { ThemeProvider } from './theme/theme-provider';
// @ts-expect-error BackHandler not in react-native-web types
import { BackHandler } from 'react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('BottomSlidingInOverlayScreen', () => {
  it('opens and closes via prop', () => {
    const onClose = jest.fn();
    const { getByText, queryByText, rerender } = render(
      <ThemeProvider forcedScheme="light">
        <BottomSlidingInOverlayScreen open onClose={onClose}>
          <Text>Content</Text>
        </BottomSlidingInOverlayScreen>
      </ThemeProvider>,
    );
    expect(getByText('Content')).toBeInTheDocument();
    rerender(
      <ThemeProvider forcedScheme="light">
        <BottomSlidingInOverlayScreen open={false} onClose={onClose}>
          <Text>Content</Text>
        </BottomSlidingInOverlayScreen>
      </ThemeProvider>,
    );
    expect(onClose).toHaveBeenCalled();
    expect(queryByText('Content')).toBeNull();
  });

  it('backdrop press closes overlay', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ThemeProvider forcedScheme="light">
        <BottomSlidingInOverlayScreen open onClose={onClose}>
          <Text>Content</Text>
        </BottomSlidingInOverlayScreen>
      </ThemeProvider>,
    );
    fireEvent.click(getByTestId('overlay-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('hardware back closes overlay', () => {
    const onClose = jest.fn();
    const addSpy = jest.spyOn(BackHandler, 'addEventListener');
    render(
      <ThemeProvider forcedScheme="light">
        <BottomSlidingInOverlayScreen open onClose={onClose}>
          <Text>Content</Text>
        </BottomSlidingInOverlayScreen>
      </ThemeProvider>,
    );
    const handler = addSpy.mock.calls[0][1];
    handler();
    expect(onClose).toHaveBeenCalled();
  });
});
