import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { Chat } from '@hum/ui-screens';

const constantsMock = {
  appOwnership: 'standalone' as const,
  executionEnvironment: 'bare' as const,
  expoConfig: { extra: {} as { devFeatures?: boolean } },
};

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: constantsMock,
}));

jest.mock('@hum/i18n', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    __esModule: true,
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => (
      <React.Fragment>{children}</React.Fragment>
    ),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => (
      <View testID="gesture-root">{children}</View>
    ),
  };
});

jest.mock('@hum/ui-components', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  const themeState = {
    forcedScheme: undefined as 'light' | 'dark' | undefined,
  };
  const ThemeProvider = ({
    children,
    forcedScheme,
  }: {
    children: React.ReactNode;
    forcedScheme: 'light' | 'dark';
  }) => {
    themeState.forcedScheme = forcedScheme;
    return (
      <View testID="theme-provider">
        <Text testID="forced-scheme">{forcedScheme}</Text>
        {children}
      </View>
    );
  };
  const OverlayProvider = ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  );
  const Button = ({
    children,
    onPress,
    testID,
  }: {
    children: React.ReactNode;
    onPress: () => void;
    testID?: string;
  }) => (
    <TouchableOpacity onPress={onPress} testID={testID}>
      {children}
    </TouchableOpacity>
  );
  const SlideTransition = ({
    activeKey,
    scenes,
  }: {
    activeKey: string;
    scenes: Record<string, React.ReactNode>;
  }) => <View testID={`slide-${activeKey}`}>{scenes[activeKey]}</View>;
  const BottomNavigation = ({
    onTabChange,
    activeTab,
  }: {
    onTabChange: (tab: string) => void;
    activeTab: string;
  }) => (
    <View testID="bottom-nav">
      <Text testID="active-tab">{activeTab}</Text>
      <TouchableOpacity testID="tab-chats" onPress={() => onTabChange('chats')}>
        <Text>Chats</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="tab-calls" onPress={() => onTabChange('calls')}>
        <Text>Calls</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="tab-payments"
        onPress={() => onTabChange('payments')}
      >
        <Text>Payments</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="tab-settings"
        onPress={() => onTabChange('settings')}
      >
        <Text>Settings</Text>
      </TouchableOpacity>
    </View>
  );
  return {
    __esModule: true,
    BottomNavigation,
    ThemeProvider,
    OverlayProvider,
    Button,
    SlideTransition,
    __themeState: themeState,
  };
});

jest.mock('@hum/ui-screens', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    __esModule: true,
    ChatsScreen: ({
      chats,
      onNavigateToChat,
    }: {
      chats: Chat[];
      onNavigateToChat: (chat: Chat) => void;
    }) => (
      <View testID="chats-screen">
        {chats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            testID={`chat-${chat.id}`}
            onPress={() => onNavigateToChat(chat)}
          >
            <Text>{chat.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          testID="open-first-chat"
          disabled={chats.length === 0}
          onPress={() => chats.length > 0 && onNavigateToChat(chats[0] as Chat)}
        >
          <Text>Open</Text>
        </TouchableOpacity>
      </View>
    ),
    ChatScreen: ({
      onBack,
      messages,
    }: {
      onBack: () => void;
      messages: unknown[];
    }) => (
      <View testID="chat-screen">
        <Text testID="message-count">{messages.length}</Text>
        <TouchableOpacity testID="chat-back" onPress={onBack}>
          <Text>Back</Text>
        </TouchableOpacity>
      </View>
    ),
    LightningScreen: () => (
      <View testID="lightning-screen">
        <Text>Lightning</Text>
      </View>
    ),
    CallsScreen: () => (
      <View testID="calls-screen">
        <Text>Calls</Text>
      </View>
    ),
  };
});

jest.mock('../apps/mobile/setting_screens', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    __esModule: true,
    MainSettingsScreen: ({
      onNavigateToTheme,
    }: {
      onNavigateToTheme: () => void;
    }) => (
      <View testID="main-settings">
        <TouchableOpacity testID="go-theme" onPress={onNavigateToTheme}>
          <Text>Theme</Text>
        </TouchableOpacity>
      </View>
    ),
    ThemeSettingsScreen: ({
      theme,
      onBack,
      onSelectTheme,
    }: {
      theme: 'light' | 'dark' | 'auto';
      onBack: () => void;
      onSelectTheme: (theme: 'light' | 'dark' | 'auto') => void;
    }) => (
      <View testID="theme-settings">
        <Text testID="current-theme">{theme}</Text>
        <TouchableOpacity
          testID="select-dark"
          onPress={() => onSelectTheme('dark')}
        >
          <Text>Dark</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="theme-back" onPress={onBack}>
          <Text>Back</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

jest.mock('../apps/mobile/src/DevNativeBridgeScreen', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    __esModule: true,
    default: ({ onBack }: { onBack: () => void }) => (
      <View testID="dev-screen">
        <Text>Dev</Text>
        <TouchableOpacity testID="dev-back" onPress={onBack}>
          <Text>Back</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

const i18nModule = {
  changeLanguage: jest.fn(),
};

jest.mock('react-i18next', () => ({
  __esModule: true,
  I18nextProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: i18nModule,
  }),
  __mockI18n: i18nModule,
}));

jest.mock('../apps/mobile/src/hum/HumClientProvider', () => {
  const React = require('react');
  const contextValue: {
    chats: Chat[];
    getMessages: jest.Mock<Promise<unknown[]>, [string]>;
  } = {
    chats: [],
    getMessages: jest.fn(async (_roomId: string) => []),
  };
  const Ctx = React.createContext(contextValue);
  return {
    __esModule: true,
    HumClientProvider: ({ children }: { children: React.ReactNode }) => (
      <Ctx.Provider value={contextValue}>{children}</Ctx.Provider>
    ),
    useHumClient: () => React.useContext(Ctx),
    __setMockHumClientValue: ({
      chats,
      getMessages,
    }: {
      chats?: Chat[];
      getMessages?: jest.Mock<Promise<unknown[]>, [string]>;
    }) => {
      if (chats) {
        contextValue.chats = chats;
      }
      if (getMessages) {
        contextValue.getMessages = getMessages;
      }
    },
    __getMockHumClientValue: () => contextValue,
  };
});

import App from '../apps/mobile/App';

describe('App', () => {
  const reactNative = require('react-native');
  const colorSchemeSpy = jest.spyOn(reactNative, 'useColorScheme');
  const { __setMockHumClientValue, __getMockHumClientValue } =
    require('../apps/mobile/src/hum/HumClientProvider') as {
      __setMockHumClientValue: ({
        chats,
        getMessages,
      }: {
        chats?: Chat[];
        getMessages?: jest.Mock<Promise<unknown[]>, [string]>;
      }) => void;
      __getMockHumClientValue: () => {
        chats: Chat[];
        getMessages: jest.Mock<Promise<unknown[]>, [string]>;
      };
    };
  const { __themeState } = require('@hum/ui-components') as {
    __themeState: { forcedScheme: 'light' | 'dark' | undefined };
  };
  const { __mockI18n } = require('react-i18next') as {
    __mockI18n: { changeLanguage: jest.Mock };
  };
  const constants = constantsMock;

  beforeEach(() => {
    jest.clearAllMocks();
    colorSchemeSpy.mockReturnValue('light');
    constants.expoConfig.extra = {};
    __setMockHumClientValue({
      chats: [],
      getMessages: jest.fn(async (_roomId: string) => []),
    });
    __themeState.forcedScheme = undefined;
    __mockI18n.changeLanguage.mockReset();
  });

  afterAll(() => {
    colorSchemeSpy.mockRestore();
  });

  it('renders chats and navigates to a chat with messages', async () => {
    const chats: Chat[] = [
      {
        id: 'chat-1',
        name: 'General',
        message: 'hello',
        time: 'now',
        avatar: 'a',
        unreadCount: 0,
      },
    ];
    const getMessages = jest.fn(async (_roomId: string) => [
      {
        id: 'm1',
        text: 'Hello',
        time: '10:00',
        isOutgoing: false,
        isRead: true,
      },
    ]);
    __setMockHumClientValue({ chats, getMessages });

    const screen = render(<App />);

    const getByTestId = (id: string) =>
      screen.UNSAFE_getByProps({ testID: id });
    const queryByTestId = (id: string) => {
      try {
        const all = screen.UNSAFE_getAllByProps({ testID: id });
        return all.length > 0 ? all[0] : null;
      } catch {
        return null;
      }
    };

    expect(getByTestId('chats-screen')).toBeTruthy();
    expect(getByTestId('bottom-nav')).toBeTruthy();
    expect(__themeState.forcedScheme).toBe('light');

    fireEvent.press(getByTestId('open-first-chat'));

    await waitFor(() => expect(getMessages).toHaveBeenCalledWith('chat-1'));
    expect(getByTestId('chat-screen')).toBeTruthy();
    expect(getByTestId('message-count').props.children).toBe(1);
    expect(queryByTestId('bottom-nav')).toBeNull();

    fireEvent.press(getByTestId('chat-back'));

    await waitFor(() => expect(getByTestId('chats-screen')).toBeTruthy());
    expect(getByTestId('bottom-nav')).toBeTruthy();
  });

  it('switches tabs and updates theme settings', async () => {
    colorSchemeSpy.mockReturnValue('dark');
    const getMessages = jest.fn(async (_roomId: string) => []);
    __setMockHumClientValue({
      chats: [],
      getMessages,
    });

    const screen = render(<App />);
    const getByTestId = (id: string) =>
      screen.UNSAFE_getByProps({ testID: id });

    fireEvent.press(getByTestId('tab-calls'));
    expect(getByTestId('calls-screen')).toBeTruthy();

    fireEvent.press(getByTestId('tab-payments'));
    expect(getByTestId('lightning-screen')).toBeTruthy();

    fireEvent.press(getByTestId('tab-settings'));
    expect(getByTestId('main-settings')).toBeTruthy();

    fireEvent.press(getByTestId('go-theme'));
    expect(getByTestId('theme-settings')).toBeTruthy();
    expect(getByTestId('current-theme').props.children).toBe('auto');

    fireEvent.press(getByTestId('select-dark'));
    await waitFor(() =>
      expect(getByTestId('current-theme').props.children).toBe('dark'),
    );
    expect(__themeState.forcedScheme).toBe('dark');

    fireEvent.press(getByTestId('theme-back'));
    expect(getByTestId('main-settings')).toBeTruthy();
  });

  it('enables developer tools and language switching when dev features are on', async () => {
    constants.expoConfig.extra = { devFeatures: true };
    const getMessages = jest.fn(async (_roomId: string) => []);
    __setMockHumClientValue({ getMessages });

    const screen = render(<App />);
    const getByTestId = (id: string) =>
      screen.UNSAFE_getByProps({ testID: id });
    const queryByTestId = (id: string) => {
      try {
        const all = screen.UNSAFE_getAllByProps({ testID: id });
        return all.length > 0 ? all[0] : null;
      } catch {
        return null;
      }
    };

    expect(getByTestId('btnOpenDev')).toBeTruthy();
    fireEvent.press(getByTestId('btnEn'));
    expect(__mockI18n.changeLanguage).toHaveBeenCalledWith('en');

    fireEvent.press(getByTestId('btnDe'));
    expect(__mockI18n.changeLanguage).toHaveBeenCalledWith('de');

    fireEvent(getByTestId('btnOpenDev'), 'touchEnd');
    await waitFor(() => expect(getByTestId('dev-screen')).toBeTruthy());
    expect(queryByTestId('bottom-nav')).toBeNull();

    fireEvent.press(getByTestId('dev-back'));
    await waitFor(() => expect(queryByTestId('dev-screen')).toBeNull());
    expect(getByTestId('bottom-nav')).toBeTruthy();
  });
});
