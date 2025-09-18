import React from 'react';
import { render } from '@testing-library/react-native';
import { MessageBubble, type MessageBubbleProps } from './message-bubble';
import { ThemeProvider } from './theme/theme-provider';

type Scheme = 'light' | 'dark';

const baseProps: MessageBubbleProps = {
  text: 'Hello there',
  time: '14:15',
  isOutgoing: true,
  isRead: true,
};

function renderBubble(
  scheme: Scheme = 'light',
  props: Partial<MessageBubbleProps> = {},
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <MessageBubble {...baseProps} {...props} />
    </ThemeProvider>,
  );
}

describe('MessageBubble', () => {
  it('renders and matches snapshot', () => {
    const { toJSON } = renderBubble();
    expect(toJSON()).toMatchSnapshot();
  });

  it('shows read indicator when isRead', () => {
    const { UNSAFE_getByProps } = renderBubble('light', { isRead: true });
    expect(UNSAFE_getByProps({ children: '✓✓' })).toBeTruthy();
  });

  it('applies theme colors', () => {
    const { getByLabelText, rerender } = renderBubble('light');
    expect(getByLabelText('Outgoing message')).toHaveStyle({
      backgroundColor: 'rgba(254,202,26,1.00)',
    });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <MessageBubble {...baseProps} />
      </ThemeProvider>,
    );
    expect(getByLabelText('Outgoing message')).toHaveStyle({
      backgroundColor: 'rgba(254,202,26,1.00)',
    });
  });
});
