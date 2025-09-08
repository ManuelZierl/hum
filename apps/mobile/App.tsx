import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomNavigation, ThemeProvider } from '@hum/ui-components';
import {
  ChatsScreen,
  ChatScreen,
  LightningScreen,
  CallsScreen,
  type Chat,
} from '@hum/ui-screens';
import { MainSettingsScreen, ThemeSettingsScreen } from './setting_screens';
export default function App() {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [settingsView, setSettingsView] = useState<'main' | 'theme'>('main');
  const systemScheme = useColorScheme() ?? 'light';
  const resolvedScheme = theme === 'auto' ? systemScheme : theme;

  return (
    <SafeAreaProvider>
      <ThemeProvider forcedScheme={resolvedScheme}>
        <View style={styles.container}>
          {selectedChat ? (
            <ChatScreen
              chatName={selectedChat.name}
              chatAvatar={selectedChat.avatar}
              onBack={() => setSelectedChat(null)}
            />
          ) : activeTab === 'chats' ? (
            <ChatsScreen onNavigateToChat={setSelectedChat} />
          ) : activeTab === 'calls' ? (
            <CallsScreen />
          ) : activeTab === 'payments' ? (
            <LightningScreen />
          ) : settingsView === 'theme' ? (
            <ThemeSettingsScreen
              theme={theme}
              onBack={() => setSettingsView('main')}
              onSelectTheme={setTheme}
            />
          ) : (
            <MainSettingsScreen
              theme={theme}
              onNavigateToTheme={() => setSettingsView('theme')}
            />
          )}
          {!selectedChat && (
            <BottomNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
