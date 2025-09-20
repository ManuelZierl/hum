import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { spacing } from './theme/spacing';
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

  it('uses a multiline text input that grows with content', () => {
    const { getByLabelText } = renderComponent();
    const minHeight = spacing.lg * 2;
    const maxHeight = spacing.xl * 6;

    const textInput = getByLabelText('Message input');

    fireEvent(textInput, 'contentSizeChange', {
      nativeEvent: { contentSize: { height: 10 } },
    });

    let flattened = StyleSheet.flatten(
      getByLabelText('Message input').props.style,
    );
    const compactHeight =
      typeof flattened.height === 'string'
        ? parseFloat(flattened.height)
        : flattened.height;
    expect(compactHeight).toBe(minHeight);
    fireEvent(textInput, 'contentSizeChange', {
      nativeEvent: { contentSize: { height: 300 } },
    });

    flattened = StyleSheet.flatten(getByLabelText('Message input').props.style);
    const expandedHeight =
      typeof flattened.height === 'string'
        ? parseFloat(flattened.height)
        : flattened.height;
    expect(expandedHeight).toBe(maxHeight);
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
