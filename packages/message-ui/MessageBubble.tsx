import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type MessageBubbleProps = {
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | '';
  isReply?: boolean;
  isSelected?: boolean;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  sender,
  text,
  timestamp,
  status,
  isReply,
  isSelected,
}) => {
  const isMe = sender === 'me';
  return (
    <View
      style={[
        styles.container,
        isMe ? styles.meContainer : styles.themContainer,
        isSelected && styles.selected,
      ]}
    >
      {isReply && <Text style={styles.reply}>Reply</Text>}
      <Text style={styles.text}>{text}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.timestamp}>{timestamp}</Text>
        {isMe && <Text style={styles.status}>{status}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  meContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
  },
  themContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  selected: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  reply: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    color: '#555',
  },
  status: {
    fontSize: 10,
    color: '#555',
    marginLeft: 4,
  },
});

export default MessageBubble;
