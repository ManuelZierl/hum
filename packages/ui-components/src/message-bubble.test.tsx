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

  it('hides read indicator when message is unread', () => {
    const { queryByText } = renderBubble('light', { isRead: false });
    expect(queryByText('✓✓')).toBeNull();
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

  it('renders incoming messages with correct styles and accessibility', () => {
    const { getByLabelText } = renderBubble('light', {
      isOutgoing: false,
      isRead: false,
    });

    const bubble = getByLabelText('Incoming message');
    expect(bubble).toBeTruthy();
    expect(bubble).toHaveStyle({
      backgroundColor: 'rgba(236,236,240,1.00)',
    });
    const messageText = bubble.findByProps({ children: baseProps.text });
    expect(messageText.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#0A0A0A' })]),
    );
    const timeText = bubble.findByProps({ children: baseProps.time });
    expect(timeText.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#717182' })]),
    );
  });

  it('renders formatted body when provided', () => {
    const { toJSON } = renderBubble('light', {
      formattedBody: '<p><strong>Hello</strong></p>',
      text: 'Fallback',
    });

    const tree = toJSON();
    expect(JSON.stringify(tree)).toContain('message-rich-text');
  });
});
