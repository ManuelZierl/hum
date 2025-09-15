import React, { useMemo, useState } from 'react';
import { View, StyleSheet, useColorScheme, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomNavigation, ThemeProvider, Button } from '@hum/ui-components';
import Constants from 'expo-constants';
import {
  ChatsScreen,
  ChatScreen,
  LightningScreen,
  type Chat,
} from '@hum/ui-screens';
import { MainSettingsScreen, ThemeSettingsScreen } from './setting_screens';
import DevNativeBridgeScreen from './src/DevNativeBridgeScreen';
import { HumClientProvider, useHumClient } from './src/hum/HumClientProvider';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '@hum/i18n';

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
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [settingsView, setSettingsView] = useState<'main' | 'theme'>('main');
  const systemScheme = useColorScheme() ?? 'light';
  const resolvedScheme = theme === 'auto' ? systemScheme : theme;
  const { i18n: i18next } = useTranslation();

  return (
    <SafeAreaProvider>
      <ThemeProvider forcedScheme={resolvedScheme}>
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
              <View style={styles.langRow}>
                <Button
                  size="sm"
                  onPress={() => i18next.changeLanguage('en')}
                  testID="btnEn"
                >
                  <Text>EN</Text>
                </Button>
                <View style={styles.langSpacer} />
                <Button
                  size="sm"
                  onPress={() => i18next.changeLanguage('de')}
                  testID="btnDe"
                >
                  <Text>DE</Text>
                </Button>
              </View>
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
    <I18nextProvider i18n={i18n}>
      <HumClientProvider>
        <AppInner />
      </HumClientProvider>
    </I18nextProvider>
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
  langSpacer: { width: 8 },
  langRow: { flexDirection: 'row', marginTop: 8 },
});
