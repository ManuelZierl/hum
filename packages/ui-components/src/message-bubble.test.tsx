import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { MessageBubble, type MessageBubbleProps } from './message-bubble';
import { ThemeProvider } from './theme/ThemeProvider';

function renderBubble(
  scheme: 'light' | 'dark' = 'light',
  props?: Partial<MessageBubbleProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <MessageBubble
        testID="bubble"
        text="Hello"
        time="10:00"
        isOutgoing={false}
        {...props}
      />
    </ThemeProvider>,
  );
}

describe('MessageBubble', () => {
  it('renders component', () => {
    renderBubble();
    expect(screen.getByTestId('bubble')).toBeInTheDocument();
  });

  it('shows read indicator for outgoing read messages', () => {
    renderBubble('light', { isOutgoing: true, isRead: true });
    expect(screen.getByText('✓✓')).toBeInTheDocument();
  });

  it('supports dark mode', () => {
    const { rerender } = renderBubble('light');
    rerender(
      <ThemeProvider forcedScheme="dark">
        <MessageBubble
          testID="bubble"
          text="Hello"
          time="10:00"
          isOutgoing={false}
        />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('bubble')).toBeInTheDocument();
  });
});
