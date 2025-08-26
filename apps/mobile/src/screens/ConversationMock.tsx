import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ConversationHeader from '../components/conversation/ConversationHeader';
import MessageBubble, {
  MessageBubbleProps,
} from '../components/conversation/MessageBubble';
import DaySeparator from '../components/conversation/DaySeparator';
import ComposerMock from '../components/conversation/ComposerMock';

const messages: Array<
  | { id: string; type: 'separator'; label: string }
  | (MessageBubbleProps & { id: string })
> = [
  { id: 'sep1', type: 'separator', label: 'Yesterday' },
  {
    id: '1',
    sender: 'them',
    text: 'Hey, are we still on for tonight?',
    time: '09:41',
  },
  {
    id: '2',
    sender: 'me',
    text: 'Absolutely! Looking forward to catching up later. This is a bit longer to wrap across lines.',
    time: '09:42',
    status: 'delivered',
  },
  { id: '3', sender: 'them', text: '👍', time: '09:43' },
  { id: 'sep2', type: 'separator', label: 'Today' },
  {
    id: '4',
    sender: 'me',
    isReply: true,
    replyPreviewText: 'Hey, are we still on for tonight?',
    text: 'Yep, leaving in 5.',
    time: '17:10',
    status: 'sent',
  },
  { id: '5', sender: 'them', imageMock: true, time: '17:12' },
  {
    id: '6',
    sender: 'me',
    text: 'See you soon! 👋',
    time: '17:13',
    status: 'read',
  },
];

const ConversationMock: React.FC = () => {
  return (
    <View style={styles.container}>
      <ConversationHeader />
      <FlatList
        data={messages}
        inverted
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          'type' in item && item.type === 'separator' ? (
            <DaySeparator label={item.label} />
          ) : (
            <MessageBubble {...(item as MessageBubbleProps)} />
          )
        }
        contentContainerStyle={styles.listContent}
      />
      <ComposerMock />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5ddd5',
  },
  listContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingVertical: 8,
  },
});

export default ConversationMock;
