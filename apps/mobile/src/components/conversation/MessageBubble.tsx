import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type MessageBubbleProps = {
  sender: 'me' | 'them';
  text?: string;
  imageMock?: boolean;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  isReply?: boolean;
  replyPreviewText?: string;
};

const statusIcons: Record<string, string> = {
  sent: '✓',
  delivered: '✓✓',
  read: '✓✓',
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  sender,
  text,
  imageMock,
  time,
  status,
  isReply,
  replyPreviewText,
}) => {
  const alignment = sender === 'me' ? styles.meContainer : styles.themContainer;
  const bubbleStyle = sender === 'me' ? styles.meBubble : styles.themBubble;

  const labelParts = [sender === 'me' ? 'You' : 'Them', time];
  if (sender === 'me' && status) {
    labelParts.push(status);
  }
  if (text) {
    labelParts.push(text);
  } else if (imageMock) {
    labelParts.push('Image');
  }

  return (
    <View style={[styles.container, alignment]}>
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={labelParts.join(', ')}
        style={[styles.bubble, bubbleStyle]}
      >
        {isReply && replyPreviewText ? (
          <Text style={styles.replyPreview} numberOfLines={1}>
            {replyPreviewText}
          </Text>
        ) : null}
        {imageMock ? (
          <View style={styles.imageMock} />
        ) : (
          <Text style={styles.messageText}>{text}</Text>
        )}
        <View style={styles.meta}>
          <Text style={styles.time}>{time}</Text>
          {sender === 'me' && status ? (
            <Text
              style={[styles.status, status === 'read' && styles.statusRead]}
            >
              {statusIcons[status]}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  meContainer: {
    justifyContent: 'flex-end',
  },
  themContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    padding: 8,
    borderRadius: 16,
  },
  meBubble: {
    backgroundColor: '#dcf8c6',
    borderBottomRightRadius: 2,
    alignSelf: 'flex-end',
  },
  themBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 2,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  replyPreview: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  time: {
    fontSize: 10,
    color: '#555',
  },
  status: {
    fontSize: 10,
    color: '#555',
    marginLeft: 4,
  },
  statusRead: {
    color: '#1a73e8',
  },
  imageMock: {
    width: 180,
    height: 120,
    backgroundColor: '#ccc',
    borderRadius: 8,
  },
});

export default MessageBubble;
