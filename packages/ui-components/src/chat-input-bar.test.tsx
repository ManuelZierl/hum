import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, TextInput } from 'react-native';
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

  it('grows with content size and enables scrolling past the limit', () => {
    const { getByLabelText, UNSAFE_getByType } = renderComponent();
    expect(getByLabelText('Message input')).toBeTruthy();

    let input = UNSAFE_getByType(TextInput);

    expect(input.props.multiline).toBe(true);
    expect(input.props.scrollEnabled).toBe(false);

    fireEvent(input, 'contentSizeChange', {
      nativeEvent: { contentSize: { height: 20 } },
    });

    input = UNSAFE_getByType(TextInput);
    let flattened = StyleSheet.flatten(input.props.style);
    expect(flattened.height).toBe(flattened.minHeight);
    expect(input.props.scrollEnabled).toBe(false);

    fireEvent(input, 'contentSizeChange', {
      nativeEvent: { contentSize: { height: 300 } },
    });

    input = UNSAFE_getByType(TextInput);
    flattened = StyleSheet.flatten(input.props.style);
    expect(flattened.height).toBe(flattened.maxHeight);
    expect(input.props.scrollEnabled).toBe(true);
  });
});
