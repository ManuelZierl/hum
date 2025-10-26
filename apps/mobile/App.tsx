import React, { useMemo, useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BottomNavigation,
  ThemeProvider,
  OverlayProvider,
  SlideTransition,
  TypographyProvider,
  TYPOGRAPHY_SCALE_OPTIONS,
} from '@hum/ui-components';
import Constants from 'expo-constants';
import {
  ChatsScreen,
  ChatScreen,
  LightningScreen,
  CallsScreen,
  type Chat,
} from '@hum/ui-screens';
import type { ChatMessage } from '@hum/ui-screens/ChatScreen';
import { MainSettingsScreen, ThemeSettingsScreen } from './setting_screens';
import DevNativeBridgeScreen from './src/DevNativeBridgeScreen';
import { DevToolsOverlay } from './src/DevToolsOverlay';
import { HumClientProvider, useHumClient } from './src/hum/HumClientProvider';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '@hum/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TYPOGRAPHY_SCALE_STORAGE_KEY = 'settings.typography.scaleIndex';
const DEFAULT_TYPOGRAPHY_INDEX = Math.max(
  0,
  TYPOGRAPHY_SCALE_OPTIONS.findIndex((option) => option.id === 'md'),
);

const clampTypographyIndex = (value: number) =>
  Math.min(
    Math.max(
      Math.round(Number.isFinite(value) ? value : DEFAULT_TYPOGRAPHY_INDEX),
      0,
    ),
    TYPOGRAPHY_SCALE_OPTIONS.length - 1,
  );

function AppInner() {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatTransitionDirection, setChatTransitionDirection] = useState<
    'forward' | 'backward'
  >('forward');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
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
  const [settingsTransitionDirection, setSettingsTransitionDirection] =
    useState<'forward' | 'backward'>('forward');
  const [typographyScaleIndex, setTypographyScaleIndex] = useState<number>(
    DEFAULT_TYPOGRAPHY_INDEX,
  );
  const systemScheme = useColorScheme() ?? 'light';
  const resolvedScheme = theme === 'auto' ? systemScheme : theme;
  const { i18n: i18next } = useTranslation();
  const { getMessages } = useHumClient();

  React.useEffect(() => {
    let cancelled = false;
    if (selectedChat) {
      getMessages(selectedChat.id).then((msgs) => {
        if (!cancelled) setChatMessages(msgs);
      });
    } else {
      setChatMessages([]);
    }
    return () => {
      cancelled = true;
    };
  }, [selectedChat, getMessages]);

  const handleNavigateToChat = (chat: Chat) => {
    setChatTransitionDirection('forward');
    setSelectedChat(chat);
  };

  const handleChatBack = () => {
    setChatTransitionDirection('backward');
    setSelectedChat(null);
  };

  const handleNavigateToTheme = () => {
    setSettingsTransitionDirection('forward');
    setSettingsView('theme');
  };

  const handleThemeBack = () => {
    setSettingsTransitionDirection('backward');
    setSettingsView('main');
  };
  React.useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(TYPOGRAPHY_SCALE_STORAGE_KEY)
      .then((stored) => {
        if (!isMounted || stored == null) return;
        const parsed = Number(stored);
        if (Number.isNaN(parsed)) return;
        const clamped = clampTypographyIndex(parsed);
        setTypographyScaleIndex(clamped);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTypographyScaleChange = React.useCallback((index: number) => {
    const clamped = clampTypographyIndex(index);
    setTypographyScaleIndex((current) => {
      if (current === clamped) return current;
      AsyncStorage.setItem(TYPOGRAPHY_SCALE_STORAGE_KEY, String(clamped)).catch(
        () => {},
      );
      return clamped;
    });
  }, []);

  const renderCurrentScreen = () => {
    if (showDev) {
      return <DevNativeBridgeScreen onBack={() => setShowDev(false)} />;
    }

    switch (activeTab) {
      case 'chats':
        return (
          <SlideTransition
            activeKey={selectedChat ? 'chat' : 'list'}
            direction={chatTransitionDirection}
            scenes={{
              list: (
                <ChatsFromProvider onNavigateToChat={handleNavigateToChat} />
              ),
              chat: selectedChat ? (
                <ChatScreen
                  chatName={selectedChat.name}
                  chatAvatar={selectedChat.avatar}
                  messages={chatMessages}
                  onBack={handleChatBack}
                />
              ) : null,
            }}
          />
        );
      case 'calls':
        return <CallsScreen />;
      case 'payments':
      case 'lightning':
        return <LightningScreen />;
      case 'settings':
      default:
        return (
          <SlideTransition
            activeKey={settingsView === 'theme' ? 'theme' : 'main'}
            direction={settingsTransitionDirection}
            scenes={{
              main: (
                <MainSettingsScreen
                  theme={theme}
                  onNavigateToTheme={handleNavigateToTheme}
                />
              ),
              theme: (
                <ThemeSettingsScreen
                  theme={theme}
                  onBack={handleThemeBack}
                  onSelectTheme={setTheme}
                />
              ),
            }}
          />
        );
    }
  };

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaProvider>
        <TypographyProvider
          initialScaleIndex={typographyScaleIndex}
          onScaleIndexChange={handleTypographyScaleChange}
        >
          <ThemeProvider forcedScheme={resolvedScheme}>
            <OverlayProvider>
              <View style={styles.container}>
                {renderCurrentScreen()}
                {!selectedChat && !showDev && (
                  <BottomNavigation
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                )}
                {enableDev && !showDev && (
                  <DevToolsOverlay
                    onOpenDev={() => setShowDev(true)}
                    onSelectLanguage={i18next.changeLanguage}
                  />
                )}
              </View>
            </OverlayProvider>
          </ThemeProvider>
        </TypographyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
  gestureRoot: { flex: 1 },
});
