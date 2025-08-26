import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet } from 'react-native';
import ShellMock from './src/screens/ShellMock';
import ChatsListMock from './src/screens/ChatsListMock';
import ConversationMock from './src/screens/ConversationMock';
import SettingsMock from './src/screens/SettingsMock';

type Screen = 'shell' | 'chats' | 'conversation' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('shell');

  const renderScreen = () => {
    switch (screen) {
      case 'chats':
        return <ChatsListMock />;
      case 'conversation':
        return <ConversationMock />;
      case 'settings':
        return <SettingsMock />;
      default:
        return <ShellMock />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nav}>
        {(['shell', 'chats', 'conversation', 'settings'] as Screen[]).map((s) => (
          <Pressable key={s} onPress={() => setScreen(s)} style={styles.navButton}>
            <Text style={styles.navText}>{s}</Text>
          </Pressable>
        ))}
      </View>
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  navButton: {
    padding: 4,
  },
  navText: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
});
