import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CallItem, type CallItemProps } from './call-item';
import { ThemeProvider } from './theme/theme-provider';

type Scheme = 'light' | 'dark';

const baseProps: CallItemProps = {
  avatar: 'https://example.com/avatar.png',
  title: 'Alice',
  subtitle: 'Yesterday, 18:40',
  type: 'incoming',
};

function renderItem(scheme: Scheme = 'light', props?: Partial<CallItemProps>) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <CallItem {...baseProps} {...props} />
    </ThemeProvider>,
  );
}

describe('CallItem', () => {
  it('renders and handles press', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderItem('light', { onPress });
    fireEvent.click(getByLabelText('Call with Alice'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders video action', () => {
    const { getByLabelText } = renderItem('light', { isVideo: true });
    expect(getByLabelText('Call video')).toBeInTheDocument();
  });

  it('missed call uses destructive color', () => {
    const { getByText } = renderItem('light', { type: 'missed' });
    expect(getByText('Yesterday, 18:40')).toHaveStyle({ color: '#D4183D' });
  });
});
