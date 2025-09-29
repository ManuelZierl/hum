import React from 'react';
import {
  act,
  fireEvent,
  render,
  waitFor,
  type RenderAPI,
} from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { ActivatePaymentScreen } from '../ActivatePaymentScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const translationMock = {
  t: (key: string) => key,
};

jest.mock('react-i18next', () => ({
  useTranslation: () => translationMock,
}));

type MockButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
};

type MockTopBarProps = {
  title: string;
};

jest.mock('@hum/ui-components', () => ({
  __esModule: true,
  Button: ({
    children,
    onPress,
    disabled,
    testID,
    accessibilityLabel,
  }: MockButtonProps) => (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      testID={testID}
    >
      <Text>{children}</Text>
    </TouchableOpacity>
  ),
  Icon: ({ name }: { name: string }) => <Text>{name}</Text>,
  TopBar: ({ title }: MockTopBarProps) => (
    <View>
      <Text>{title}</Text>
    </View>
  ),
  useTheme: () => ({
    colors: {
      background: '#000',
      foreground: '#fff',
      mutedForeground: '#ccc',
      muted: '#222',
      card: '#111',
      border: '#333',
      humPrimary: '#f80',
    },
    spacing: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16 },
    radius: { lg: 12 },
    type: {
      size: { base: 14, sm: 12, md: 16, lg: 18, '2xl': 24 },
      weight: { medium: '500' },
    },
  }),
}));

const confirmProps: {
  onComplete?: () => void;
  mnemonic?: string;
  dictionary?: string[];
  bottomOffset?: number;
} = {};

function ConfirmMock(props: {
  mnemonic: string;
  dictionary: string[];
  onComplete: () => void;
  bottomOffset: number;
}) {
  Object.assign(confirmProps, props);
  return (
    <View testID="confirm-mnemonic">
      <Text>confirm</Text>
      <TouchableOpacity testID="complete-confirm" onPress={props.onComplete}>
        <Text>complete</Text>
      </TouchableOpacity>
    </View>
  );
}

jest.mock('../ConfirmMnemonicScreen', () => ({
  __esModule: true,
  ConfirmMnemonicScreen: ConfirmMock,
  default: ConfirmMock,
}));

const clipboardMock = jest.fn();

jest.mock('expo-clipboard', () => ({
  __esModule: true,
  setStringAsync: (...args: unknown[]) => clipboardMock(...args),
}));

const generateMnemonic = jest.fn();

jest.mock('../utils/mnemonic', () => ({
  __esModule: true,
  WORDLIST: ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'nu', 'xi'],
  generateMnemonic: () => generateMnemonic(),
}));

const extractText = (node: unknown): string => {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join('');
  }
  if (typeof node === 'object' && 'props' in node) {
    return extractText(
      (node as { props?: { children?: unknown } }).props?.children,
    );
  }
  return '';
};

const getTextContent = (element: { props?: { children?: unknown } }) =>
  extractText(element.props?.children);

const findByTextContent = async (api: RenderAPI, text: string) => {
  await waitFor(() => {
    expect(api.UNSAFE_queryAllByProps({ children: text })).not.toHaveLength(0);
  });
  return api.UNSAFE_getByProps({ children: text });
};

const getByTextContent = (api: RenderAPI, text: string) =>
  api.UNSAFE_getByProps({ children: text });

const findByTestID = async (api: RenderAPI, testID: string) => {
  await waitFor(() => {
    expect(api.UNSAFE_queryByProps({ testID })).not.toBeNull();
  });
  return api.UNSAFE_getByProps({ testID });
};

const getByTestID = (api: RenderAPI, testID: string) =>
  api.UNSAFE_getByProps({ testID });

describe('ActivatePaymentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    confirmProps.onComplete = undefined;
    confirmProps.mnemonic = undefined;
    confirmProps.dictionary = undefined;
    confirmProps.bottomOffset = undefined;
    generateMnemonic.mockReset();
    generateMnemonic
      .mockReturnValueOnce(
        'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu',
      )
      .mockReturnValue(
        'nu xi omicron pi rho sigma tau upsilon phi chi psi omega',
      );
  });

  it('copies the mnemonic and resets the copy label after a timeout', async () => {
    clipboardMock.mockResolvedValue(undefined);
    const screen = render(<ActivatePaymentScreen onActivated={jest.fn()} />);

    await act(async () => {
      fireEvent.press(
        getByTextContent(screen, 'payments.activate.actions.copy'),
      );
    });

    expect(clipboardMock).toHaveBeenCalledWith(
      'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu',
    );
    await findByTextContent(screen, 'payments.activate.actions.copied');
  });

  it('regenerates the mnemonic and resets copy state', () => {
    clipboardMock.mockResolvedValue(undefined);
    const screen = render(<ActivatePaymentScreen onActivated={jest.fn()} />);

    const firstWord = getTextContent(getByTestID(screen, 'mnemonic-word-1'));
    expect(firstWord).toContain('alpha');

    fireEvent.press(getByTextContent(screen, 'payments.activate.actions.copy'));
    fireEvent.press(
      getByTextContent(screen, 'payments.activate.actions.regenerate'),
    );

    const regeneratedWord = getTextContent(
      getByTestID(screen, 'mnemonic-word-1'),
    );
    expect(regeneratedWord).toContain('nu');
    expect(
      getByTextContent(screen, 'payments.activate.actions.copy'),
    ).toBeTruthy();
  });

  it('enters confirmation step and completes activation', async () => {
    const onActivated = jest.fn();
    const screen = render(<ActivatePaymentScreen onActivated={onActivated} />);

    fireEvent.press(
      getByTextContent(screen, 'payments.activate.actions.confirm_written'),
    );

    await findByTestID(screen, 'confirm-mnemonic');

    expect(confirmProps.mnemonic).toBeDefined();
    expect(confirmProps.dictionary).toEqual([
      'alpha',
      'beta',
      'gamma',
      'delta',
      'epsilon',
      'nu',
      'xi',
    ]);
    expect(confirmProps.bottomOffset).toBe(72);

    fireEvent.press(getByTestID(screen, 'complete-confirm'));
    expect(onActivated).toHaveBeenCalledWith(
      'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu',
    );
  });

  it('warns when copying fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    clipboardMock.mockRejectedValueOnce(new Error('boom'));

    const screen = render(<ActivatePaymentScreen onActivated={jest.fn()} />);

    fireEvent.press(getByTextContent(screen, 'payments.activate.actions.copy'));

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith(
        '[ActivatePaymentScreen] copy failed',
        expect.any(Error),
      );
      expect(
        getByTextContent(screen, 'payments.activate.actions.copy'),
      ).toBeTruthy();
    });

    warnSpy.mockRestore();
  });
});
