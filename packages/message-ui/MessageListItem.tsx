import React from 'react';
import { View, StyleSheet } from 'react-native';
import MessageBubble, { MessageBubbleProps } from './MessageBubble';

export type MessageListItemProps = MessageBubbleProps;

const MessageListItem: React.FC<MessageListItemProps> = (props) => (
  <View style={styles.row}>
    <MessageBubble {...props} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});

export default MessageListItem;
