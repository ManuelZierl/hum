import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { SettingsScreen } from '../SettingsScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const translationMock = {
  t: (key: string, params?: Record<string, string>) =>
    params?.defaultValue ?? key,
};

jest.mock('react-i18next', () => ({
  useTranslation: () => translationMock,
}));

type MockButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  testID?: string;
  accessibilityLabel?: string;
};

jest.mock('@hum/ui-components', () => ({
  __esModule: true,
  Button: ({
    children,
    onPress,
    testID,
    accessibilityLabel,
  }: MockButtonProps) => (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      testID={testID}
    >
      <Text>{children}</Text>
    </TouchableOpacity>
  ),
  Icon: ({ name }: { name: string }) => (
    <Text testID={`icon-${name}`}>{name}</Text>
  ),
  TopBar: ({ title }: { title: string }) => (
    <View>
      <Text>{title}</Text>
    </View>
  ),
  useTheme: () => ({
    colors: {
      background: '#000',
      foreground: '#fff',
      mutedForeground: '#ccc',
      muted: '#111',
      border: '#222',
    },
    spacing: { sm: 4, md: 8, lg: 12, xl: 16 },
    radius: { lg: 12 },
    type: {
      size: { md: 16, lg: 20, sm: 12 },
      weight: { medium: '500' },
    },
  }),
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <View testID="avatar">{children}</View>
  ),
  AvatarImage: ({ source }: { source: { uri: string } }) => (
    <Text testID="avatar-image">{source.uri}</Text>
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <Text testID="avatar-fallback">{children}</Text>
  ),
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders profile details and handles search input', () => {
    const screen = render(
      <SettingsScreen
        profileName="Alice Bob"
        profileStatus="Available"
        profileImageUri="https://example.com/avatar.png"
      />,
    );

    expect(screen.UNSAFE_getByProps({ children: 'Alice Bob' })).toBeTruthy();
    expect(screen.UNSAFE_getByProps({ children: 'Available' })).toBeTruthy();
    expect(
      screen.UNSAFE_getByProps({ children: 'https://example.com/avatar.png' }),
    ).toBeTruthy();
    expect(screen.UNSAFE_getByProps({ children: 'AB' })).toBeTruthy();

    const search = screen.getByLabelText('actions.search');
    fireEvent.changeText(search, 'bitcoin');
    expect(search.props.value).toBe('bitcoin');
  });

  it('invokes clear storage handler and logs errors', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const successClear = jest.fn().mockResolvedValue(undefined);
    const failingClear = jest.fn().mockRejectedValue(new Error('nope'));

    const screen = render(<SettingsScreen onClearStorage={successClear} />);

    fireEvent.press(screen.getByLabelText('settings.actions.clear_storage'));
    await waitFor(() => {
      expect(successClear).toHaveBeenCalled();
    });

    screen.rerender(<SettingsScreen onClearStorage={failingClear} />);
    fireEvent.press(screen.getByLabelText('settings.actions.clear_storage'));
    await waitFor(() => {
      expect(failingClear).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        '[SettingsScreen] clear storage failed',
        expect.any(Error),
      );
    });

    screen.rerender(<SettingsScreen />);
    expect(() => screen.getByText('Clear payments data')).toThrow();

    warnSpy.mockRestore();
  });

  it('falls back to initials when profile data missing', () => {
    const screen = render(<SettingsScreen />);

    expect(
      screen.UNSAFE_getByProps({ children: 'labels.your_name' }),
    ).toBeTruthy();
    expect(
      screen.UNSAFE_getByProps({ children: 'labels.profile_status_default' }),
    ).toBeTruthy();
    expect(screen.UNSAFE_getByProps({ children: 'L' })).toBeTruthy();
  });
});
