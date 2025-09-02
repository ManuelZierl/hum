import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomNavigation, ThemeProvider } from '@hum/ui-components';
import {
  ChatsScreen,
  ChatScreen,
  LightningScreen,
  SettingsScreen,
  type Chat,
} from '@hum/ui-screens';

export default function App() {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <View style={{ flex: 1 }}>
          {selectedChat ? (
            <ChatScreen
              chatName={selectedChat.name}
              chatAvatar={selectedChat.avatar}
              onBack={() => setSelectedChat(null)}
            />
          ) : activeTab === 'chats' ? (
            <ChatsScreen onNavigateToChat={setSelectedChat} />
          ) : activeTab === 'lightning' ? (
            <LightningScreen />
          ) : (
            <SettingsScreen />
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
