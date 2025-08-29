import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import {
  ChatListItem,
  getItemLayout,
  ChatListItemProps,
} from '@mchat/message-ui';

const mockChats: (ChatListItemProps & { id: string })[] = [
  {
    id: '1',
    title: 'Alice',
    preview: 'Hey, are we still on for tonight?',
    time: '09:41',
    unreadCount: 3,
  },
  {
    id: '2',
    title: 'Bob',
    preview: 'Sure, see you there!',
    time: '08:22',
    muted: true,
  },
  {
    id: '3',
    title: 'Charlie Group',
    preview: 'Charlie: Shared a photo',
    time: 'Yesterday',
    unreadCount: 12,
    pinned: true,
  },
  {
    id: '4',
    title: 'Dora',
    preview: 'Let me know.',
    time: 'Yesterday',
  },
  {
    id: '5',
    title: 'Eve',
    preview: 'This is a very long message preview that should be truncated.',
    time: 'Mon',
  },
  {
    id: '6',
    title: 'Frank',
    preview: '👍',
    time: 'Sun',
    unreadCount: 1,
  },
  {
    id: '7',
    title: 'Grace',
    preview: 'Typing...',
    time: 'Sat',
    muted: true,
    unreadCount: 2,
  },
  {
    id: '8',
    title: 'Heidi',
    preview: 'Check this out!',
    time: 'Fri',
  },
  {
    id: '9',
    title: 'Ivan',
    preview: 'Ok',
    time: 'Fri',
  },
  {
    id: '10',
    title: 'Judy',
    preview: "Let's catch up soon",
    time: 'Thu',
    unreadCount: 99,
  },
];

export default function ChatsListMock() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    header: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? '#333' : '#ccc',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
    },
    headerIcon: {
      fontSize: 18,
      color: isDark ? '#fff' : '#000',
    },
    tabs: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? '#333' : '#ccc',
    },
    tab: {
      paddingVertical: 8,
      color: isDark ? '#fff' : '#000',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>mChat</Text>
        <Text style={styles.headerIcon}>🔍</Text>
      </View>
      <View style={styles.tabs}>
        {['All', 'Unread', 'Groups'].map((tab) => (
          <Text key={tab} style={styles.tab}>
            {tab}
          </Text>
        ))}
      </View>
      <FlatList
        data={mockChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatListItem {...item} />}
        getItemLayout={getItemLayout}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} />
        }
      />
    </SafeAreaView>
  );
}
