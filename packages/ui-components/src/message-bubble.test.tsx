import React from 'react';
import { render } from '@testing-library/react';

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
    const { asFragment } = renderBubble();
    expect(asFragment()).toMatchSnapshot();
  });

  it('shows read indicator when isRead', () => {
    const { getByText } = renderBubble('light', { isRead: true });
    expect(getByText('✓✓')).toBeInTheDocument();
  });

  it('applies theme colors', () => {
    const { getByLabelText, rerender } = renderBubble('light');
    expect(getByLabelText('Outgoing message')).toHaveStyle({
      backgroundColor: 'rgb(254, 202, 26)',
    });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <MessageBubble {...baseProps} />
      </ThemeProvider>,
    );
    expect(getByLabelText('Outgoing message')).toHaveStyle({
      backgroundColor: 'rgb(254, 202, 26)',
    });
  });
});
