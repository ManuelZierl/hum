import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from './theme/theme-provider';
import { ChatInputBar } from './chat-input-bar';

describe('ChatInputBar', () => {
  function renderComponent(
    props?: Partial<React.ComponentProps<typeof ChatInputBar>>,
  ) {
    return render(
      <ThemeProvider forcedScheme="light">
        <ChatInputBar
          value=""
          onChangeText={() => {}}
          placeholder="Type a message"
          inputAccessibilityLabel="Message input"
          {...props}
        />
      </ThemeProvider>,
    );
  }

  it('calls onChangeText when text changes', () => {
    const handleChange = jest.fn();
    const { getByLabelText } = renderComponent({ onChangeText: handleChange });

    fireEvent.changeText(getByLabelText('Message input'), 'Hello');

    expect(handleChange).toHaveBeenCalledWith('Hello');
  });

  it('invokes action handlers when provided', () => {
    const onAttachmentPress = jest.fn();
    const { getByLabelText } = renderComponent({
      onAttachmentPress,
      attachmentAccessibilityLabel: 'Add attachment',
    });

    fireEvent.press(getByLabelText('Add attachment'));

    expect(onAttachmentPress).toHaveBeenCalled();
  });
});
