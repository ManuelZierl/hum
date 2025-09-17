import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CallsScreen, mockCalls } from './CallsScreen';
import { ThemeProvider, OverlayProvider } from '@hum/ui-components';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

function renderScreen(
  props?: Partial<React.ComponentProps<typeof CallsScreen>>,
) {
  return render(
    <ThemeProvider forcedScheme="dark">
      <OverlayProvider>
        <CallsScreen {...props} calls={props?.calls ?? mockCalls} />
      </OverlayProvider>
    </ThemeProvider>,
  );
}

describe('CallsScreen', () => {
  it('opens overlay on plus press', () => {
    const { getByLabelText, getByText } = renderScreen();
    fireEvent.click(getByLabelText('Add call'));
    expect(getByText('New Call')).toBeInTheDocument();
  });

  it('matches empty state snapshot', () => {
    const { asFragment } = renderScreen({ calls: [] });
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches populated snapshot', () => {
    const { asFragment } = renderScreen();
    expect(asFragment()).toMatchSnapshot();
  });
});
