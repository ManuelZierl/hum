import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomNavigation, ThemeProvider } from '@hum/ui-components';
import Constants from 'expo-constants';
import {
  ChatsScreen,
  ChatScreen,
  LightningScreen,
  SettingsScreen,
  type Chat,
} from '@hum/ui-screens';
import DevNativeBridgeScreen from './src/DevNativeBridgeScreen';
import { HumClientProvider, useHumClient } from './src/hum/HumClientProvider';
function AppInner() {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showDev, setShowDev] = useState(false);
  const enableDev = useMemo(() => {
    type AppExtra = { devFeatures?: boolean };
    type ExpoConfigLike = { extra?: AppExtra };
    const expoCfg = (Constants as unknown as { expoConfig?: ExpoConfigLike })
      .expoConfig;
    const extra: AppExtra = expoCfg?.extra ?? {};
    return !!extra.devFeatures;
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <View style={styles.container}>
          {showDev ? (
            <DevNativeBridgeScreen onBack={() => setShowDev(false)} />
          ) : selectedChat ? (
            <ChatScreen
              chatName={selectedChat.name}
              chatAvatar={selectedChat.avatar}
              onBack={() => setSelectedChat(null)}
            />
          ) : activeTab === 'chats' ? (
            <ChatsFromProvider onNavigateToChat={setSelectedChat} />
          ) : activeTab === 'lightning' ? (
            <LightningScreen />
          ) : (
            <SettingsScreen />
          )}
          {!selectedChat && !showDev && (
            <BottomNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
          {enableDev && !showDev && (
            <View style={styles.devButtonWrap}>
              <View
                style={styles.devEntry}
                testID="btnOpenDev"
                onTouchEnd={() => setShowDev(true)}
              />
            </View>
          )}
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ChatsFromProvider({
  onNavigateToChat,
}: {
  onNavigateToChat: (c: Chat) => void;
}) {
  const { chats } = useHumClient();
  return <ChatsScreen chats={chats} onNavigateToChat={onNavigateToChat} />;
}

export default function App() {
  return (
    <HumClientProvider>
      <AppInner />
    </HumClientProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  devButtonWrap: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  devEntry: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF00AA',
  },
});
