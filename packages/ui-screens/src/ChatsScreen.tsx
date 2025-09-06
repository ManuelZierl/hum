import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ThemeProvider,
  useTheme,
  Button,
  ListRow,
  Icon,
  TopBar,
  ChatItem,
} from '@hum/ui-components';

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
  initialScheme?: 'light' | 'dark';
}

export function ChatsScreen({
  onNavigateToChat,
  chats = [],
  initialScheme = 'dark',
}: ChatsScreenProps) {
  const [scheme, setScheme] = useState<'light' | 'dark'>(initialScheme);

  return (
    <ThemeProvider forcedScheme={scheme}>
      <ChatsScreenInner
        chats={chats}
        onNavigateToChat={onNavigateToChat}
        scheme={scheme}
        onToggleScheme={() =>
          setScheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
        }
      />
    </ThemeProvider>
  );
}

interface InnerProps {
  chats: Chat[];
  scheme: 'light' | 'dark';
  onToggleScheme: () => void;
  onNavigateToChat?: (chat: Chat) => void;
}

const ChatsScreenInner: React.FC<InnerProps> = ({
  chats,
  scheme,
  onToggleScheme,
  onNavigateToChat,
}) => {
  const { colors, spacing, type } = useTheme();
  const insets = useSafeAreaInsets();

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
      />

      <View
        style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}
      >
        <Text
          style={{
            color: colors.foreground,
            fontSize: type.size['2xl'],
            fontWeight: type.weight.bold,
          }}
        >
          Chats
        </Text>
      </View>

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

      <View
        style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
      >
        <Button
          variant="link"
          onPress={onToggleScheme}
          accessibilityLabel="toggle theme"
        >
          <Text>Toggle {scheme === 'dark' ? 'Light' : 'Dark'} Mode</Text>
        </Button>
      </View>

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
        onPress={() => {}}
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
