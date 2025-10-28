import React from 'react';
import type { ReactTestInstance } from 'react-test-renderer';
import {
  render,
  waitFor,
  act,
  fireEvent,
  type RenderAPI,
} from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';
import { ThemeProvider } from '@hum/ui-components';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 10, bottom: 5 })),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../apps/mobile/src/hum/nativeClient', () => ({
  __esModule: true,
  default: {
    createClient: jest.fn(),
  },
}));

import HumNative from '../apps/mobile/src/hum/nativeClient';
import DevNativeBridgeScreen from '../apps/mobile/src/DevNativeBridgeScreen';

const renderWithProviders = (ui: React.ReactElement): RenderAPI => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider forcedScheme="light">{children}</ThemeProvider>
  );
  return render(ui, { wrapper: Wrapper });
};

const extractText = (value: React.ReactNode): string => {
  if (value == null || typeof value === 'boolean') {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(extractText).join('');
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(value)) {
    return extractText(value.props.children);
  }
  return '';
};

const getTextContent = (node: ReactTestInstance): string => {
  return extractText(node.props.children as React.ReactNode).replace(
    /\s+/g,
    ' ',
  );
};

const pressButton = async (instance: ReactTestInstance): Promise<void> => {
  const props = instance.props as Record<string, unknown>;
  await act(async () => {
    if (typeof props.onPress === 'function') {
      await (props.onPress as () => Promise<void> | void)();
    } else if (typeof props.onClick === 'function') {
      (props.onClick as (event?: unknown) => void)();
    } else {
      fireEvent.press(instance);
    }
  });
};

const pressButtonByLabel = async (
  getAllByType: (type: React.ComponentType<any>) => ReactTestInstance[],
  label: string,
): Promise<void> => {
  const button = getAllByType(Pressable).find((node) =>
    getTextContent(node).includes(label),
  );
  if (!button) {
    throw new Error(`Button with label ${label} not found`);
  }
  await pressButton(button);
};

const findBackendText = (
  getAllByType: (type: React.ComponentType<any>) => ReactTestInstance[],
): ReactTestInstance => {
  const match = getAllByType(Text).find((node) =>
    getTextContent(node).startsWith('labels.backend'),
  );
  if (!match) {
    throw new Error('Backend label not found');
  }
  return match.parent ?? match;
};

const getTextNodeByTestId = (
  getAllByType: (type: React.ComponentType<any>) => ReactTestInstance[],
  testId: string,
): ReactTestInstance => {
  const match = getAllByType(Text).find((node) => {
    return (node.props as Record<string, unknown>).testID === testId;
  });
  if (!match) {
    throw new Error(`Text with testID ${testId} not found`);
  }
  return match;
};

const expectTextValue = async (
  getAllByType: (type: React.ComponentType<any>) => ReactTestInstance[],
  testId: string,
  expected: string,
): Promise<void> => {
  await waitFor(() => {
    expect(getTextContent(getTextNodeByTestId(getAllByType, testId))).toBe(
      expected,
    );
  });
};

describe('DevNativeBridgeScreen', () => {
  const createClientMock = HumNative.createClient as jest.Mock;

  const resetGlobals = () => {
    delete (globalThis as Record<string, unknown>).__HUM_FORCE_MOCK__;
    delete (globalThis as Record<string, unknown>).__HUM_USE_BACKEND__;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetGlobals();
  });

  afterEach(() => {
    resetGlobals();
  });

  it('toggles between native and mock backends', async () => {
    const { UNSAFE_getAllByType } = renderWithProviders(
      <DevNativeBridgeScreen />,
    );

    expect(getTextContent(findBackendText(UNSAFE_getAllByType))).toBe(
      'labels.backend:native',
    );

    await pressButtonByLabel(UNSAFE_getAllByType, 'actions.toggle_mock');
    expect(getTextContent(findBackendText(UNSAFE_getAllByType))).toBe(
      'labels.backend:mock',
    );

    await pressButtonByLabel(UNSAFE_getAllByType, 'actions.toggle_mock');
    expect(getTextContent(findBackendText(UNSAFE_getAllByType))).toBe(
      'labels.backend:native',
    );
  });

  it('creates and reuses a client for login, auth checks, and rooms', async () => {
    const login = jest.fn(async () => {});
    const isAuthenticated = jest.fn(async () => true);
    const getRooms = jest.fn(async () => [
      { id: 'r1', name: 'Room 1' },
      { id: 'r2', name: 'Room 2' },
    ]);

    createClientMock.mockResolvedValue({
      login,
      isAuthenticated,
      getRooms,
    });

    const { UNSAFE_getAllByType } = renderWithProviders(
      <DevNativeBridgeScreen />,
    );

    await pressButtonByLabel(UNSAFE_getAllByType, 'actions.login');
    await expectTextValue(UNSAFE_getAllByType, 'statusText', 'login-ok');
    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith('user', 'pass');

    await pressButtonByLabel(UNSAFE_getAllByType, 'actions.is_authenticated');
    await expectTextValue(UNSAFE_getAllByType, 'statusText', 'isAuth-ok');
    await expectTextValue(UNSAFE_getAllByType, 'isAuthValue', 'true');

    await pressButtonByLabel(UNSAFE_getAllByType, 'actions.get_rooms');
    await expectTextValue(UNSAFE_getAllByType, 'statusText', 'getRooms-ok');
    expect(getRooms).toHaveBeenCalled();
    await expectTextValue(UNSAFE_getAllByType, 'roomsCount', '2');

    await pressButtonByLabel(UNSAFE_getAllByType, 'actions.create_client');
    await expectTextValue(UNSAFE_getAllByType, 'statusText', 'created');
    expect(createClientMock).toHaveBeenCalledTimes(2);

    // ensure rooms count remains displayed after manual client creation
    await expectTextValue(UNSAFE_getAllByType, 'roomsCount', '2');
  });

  it('surfaces errors from client creation', async () => {
    createClientMock.mockRejectedValueOnce(new Error('boom'));

    const { UNSAFE_getAllByType } = renderWithProviders(
      <DevNativeBridgeScreen />,
    );

    await pressButtonByLabel(UNSAFE_getAllByType, 'actions.create_client');

    await expectTextValue(
      UNSAFE_getAllByType,
      'statusText',
      'create-error:boom',
    );
  });

  it('renders back button that triggers the provided callback', async () => {
    const onBack = jest.fn();
    const { UNSAFE_getAllByType } = renderWithProviders(
      <DevNativeBridgeScreen onBack={onBack} />,
    );

    await pressButtonByLabel(UNSAFE_getAllByType, 'actions.back');
    expect(onBack).toHaveBeenCalled();
  });
});
