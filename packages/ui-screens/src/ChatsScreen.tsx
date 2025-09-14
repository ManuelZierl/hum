import React from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useTheme,
  Button,
  ListRow,
  Icon,
  TopBar,
  ChatItem,
  useOverlay,
} from '@hum/ui-components';
import NewChatScreen from './NewChatScreen';

export interface Chat {
  id: string;
  name: string;
  message: string;
  time: string;
  avatar: string;
  isRead?: boolean;
  isGroup?: boolean;
  hasLocation?: boolean;
  hasHeart?: boolean;
  unreadCount?: number;
}

export interface ChatsScreenProps {
  onNavigateToChat?: (chat: Chat) => void;
  chats?: Chat[];
  // Optional: show TopBar search row
  showSearch?: boolean;
}

export function ChatsScreen({
  onNavigateToChat,
  showSearch = false,
  chats = [],
}: ChatsScreenProps) {
  return (
    <ChatsScreenInner
      chats={chats}
      onNavigateToChat={onNavigateToChat}
      showSearch={showSearch}
    />
  );
}

interface InnerProps {
  chats: Chat[];
  onNavigateToChat?: (chat: Chat) => void;
  showSearch: boolean;
}

const ChatsScreenInner: React.FC<InnerProps> = ({
  chats,
  onNavigateToChat,
  showSearch,
}) => {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { open } = useOverlay();
  const [query, setQuery] = React.useState<string>('');

  const renderItem: ListRenderItem<Chat> = ({ item }) => (
    <ChatItem
      name={item.name}
      message={item.message}
      time={item.time}
      avatar={item.avatar}
      isRead={item.isRead}
      isGroup={item.isGroup}
      hasLocation={item.hasLocation}
      hasHeart={item.hasHeart}
      unreadCount={item.unreadCount}
      onPress={() => onNavigateToChat?.(item)}
    />
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          backgroundColor: colors.background,
        },
      ]}
    >
      <TopBar
        title="Chats"
        leftItems={[
          { type: 'text', label: '⋯', onPress: () => {}, a11yLabel: 'Menu' },
        ]}
        rightItems={[
          {
            type: 'icon',
            name: 'camera',
            onPress: () => {},
            a11yLabel: 'Open camera',
          },
        ]}
        showSearch={showSearch}
        searchPlaceholder="Search"
        searchValue={query}
        onChangeSearch={setQuery}
        onSubmitSearch={() => {}}
      />

      <ListRow
        icon={<Icon name="archive" size={24} color={colors.mutedForeground} />}
        label="Archiviert"
        rightText="5"
        onPress={() => {}}
      />

      <FlatList
        data={chats}
        keyExtractor={(item: Chat) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: spacing.xl * 4 }}
      />

      <Button
        size="icon"
        accessibilityLabel="Add"
        style={[
          styles.fab,
          {
            backgroundColor: colors.humPrimary,
            right: spacing.lg,
            bottom: spacing.lg + insets.bottom,
          },
        ]}
        onPress={() => open(<NewChatScreen />)}
      >
        <Text style={[styles.plusText, { color: colors.humPrimaryForeground }]}>
          +
        </Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    fontSize: 24,
  },
});

export default ChatsScreen;
