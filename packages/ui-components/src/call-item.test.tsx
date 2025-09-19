import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CallItem, type CallItemProps } from './call-item';
import { ThemeProvider } from './theme/theme-provider';
import { Text } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

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
    fireEvent.press(getByLabelText('Call with Alice'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders video action', () => {
    const { getByLabelText } = renderItem('light', { isVideo: true });
    expect(getByLabelText('Call video')).toBeOnTheScreen();
  });

  it('missed call uses destructive color', () => {
    const { UNSAFE_getAllByType } = renderItem('light', { type: 'missed' });
    const texts = UNSAFE_getAllByType(Text);
    const findText = (node: ReactTestInstance) => {
      const c = node?.props?.children;
      const s = Array.isArray(c) ? c.join('') : String(c ?? '');
      return s.includes('Yesterday, 18:40');
    };
    const subtitle = texts.find(findText);
    expect(subtitle).toBeTruthy();
    const style = Array.isArray(subtitle!.props.style)
      ? Object.assign({}, ...subtitle!.props.style)
      : subtitle!.props.style;
    expect(style.color).toBe('#D4183D');
  });
});
