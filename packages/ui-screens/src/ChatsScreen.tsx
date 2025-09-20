import React from 'react';
import { View, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useTheme,
  ListRow,
  Icon,
  TopBar,
  ChatItem,
  useOverlay,
} from '@hum/ui-components';
import { useTranslation } from 'react-i18next';
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
  const { colors, spacing, type } = useTheme();
  const insets = useSafeAreaInsets();
  const { open } = useOverlay();
  const [query, setQuery] = React.useState<string>('');
  const { t } = useTranslation();

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
        title={t('nav.chats')}
        leftItems={[
          {
            type: 'text',
            label: '⋯',
            onPress: () => {},
            a11yLabel: t('actions.menu'),
          },
        ]}
        rightItems={[
          {
            type: 'icon',
            name: 'camera',
            onPress: () => {},
            a11yLabel: t('actions.open_camera'),
          },
          {
            type: 'text',
            label: '+',
            onPress: () => open(<NewChatScreen />),
            a11yLabel: t('actions.add'),
          },
        ]}
        showSearch={showSearch}
        searchPlaceholder={t('placeholders.search')}
        searchValue={query}
        onChangeSearch={setQuery}
        onSubmitSearch={() => {}}
      />

      <ListRow
        icon={<Icon name="archive" size={24} color={colors.mutedForeground} />}
        label={t('labels.archived')}
        rightText={String(5)}
        onPress={() => {}}
      />

      <FlatList
        data={chats}
        keyExtractor={(item: Chat) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: spacing.xl * 4 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatsScreen;
