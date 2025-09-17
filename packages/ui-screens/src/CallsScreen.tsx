import React from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useTheme,
  TopBar,
  Button,
  Icon,
  CallItem,
  useOverlay,
} from '@hum/ui-components';
import NewCallScreen from './NewCallScreen';

const STRINGS = {
  noCallsYet: 'No calls yet',
  startACall: 'Start a call',
} as const;

export interface Call {
  id: string;
  avatar: string;
  title: string;
  subtitle: string;
  type: 'incoming' | 'outgoing' | 'missed';
  isVideo?: boolean;
}

export const mockCalls: Call[] = [
  {
    id: '1',
    avatar:
      'https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Alice',
    subtitle: 'Yesterday, 18:40',
    type: 'incoming',
  },
  {
    id: '2',
    avatar:
      'https://images.unsplash.com/photo-1675705444858-97005ce93298?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Bob',
    subtitle: 'Yesterday, 09:15',
    type: 'outgoing',
    isVideo: true,
  },
  {
    id: '3',
    avatar:
      'https://images.unsplash.com/photo-1597202992582-9ee5c6672095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Charlie',
    subtitle: '2 days ago',
    type: 'missed',
  },
];

export interface CallsScreenProps {
  calls?: Call[];
}

export function CallsScreen({ calls = mockCalls }: CallsScreenProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { open } = useOverlay();

  const renderItem: ListRenderItem<Call> = ({ item }) => (
    <CallItem
      avatar={item.avatar}
      title={item.title}
      subtitle={item.subtitle}
      type={item.type}
      isVideo={item.isVideo}
      onPress={() => {}}
      onPressCall={() => {}}
    />
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingBottom: insets.bottom },
      ]}
    >
      <TopBar
        title="Calls"
        rightItems={[
          {
            type: 'text',
            label: '+',
            onPress: () => open(<NewCallScreen />),
            a11yLabel: 'Add call',
          },
        ]}
      />
      {calls.length === 0 ? (
        <View style={styles.empty} testID="empty-calls">
          <Text
            style={{
              color: colors.mutedForeground,
              marginBottom: spacing.md,
            }}
          >
            {STRINGS.noCallsYet}
          </Text>
          <Button accessibilityLabel="Start a call" onPress={() => {}}>
            <Icon name="telephone" />
            <Text style={{ color: colors.foreground, marginLeft: spacing.sm }}>
              {STRINGS.startACall}
            </Text>
          </Button>
        </View>
      ) : (
        <FlatList
          data={calls}
          keyExtractor={(item: Call) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: spacing.xl * 4 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CallsScreen;
