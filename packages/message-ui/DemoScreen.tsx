import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import MessageListItem from './MessageListItem';

const DemoScreen: React.FC = () => {
  const messages = [
    { id: 1, sender: 'them', text: 'Hello!', timestamp: '09:41' },
    { id: 2, sender: 'me', text: 'Hi there!', timestamp: '09:42', status: 'sent' },
    {
      id: 3,
      sender: 'me',
      text: 'How are you?',
      timestamp: '09:43',
      status: 'delivered',
      isSelected: true,
    },
    {
      id: 4,
      sender: 'them',
      text: 'Doing well, thanks!',
      timestamp: '09:44',
      status: '',
      isReply: true,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {messages.map((msg) => (
        <MessageListItem key={msg.id} {...msg} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5ddd5',
  },
  content: {
    paddingVertical: 16,
  },
});

export default DemoScreen;
