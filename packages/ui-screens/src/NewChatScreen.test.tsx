import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { colors as themeColors } from '@hum/ui-components/theme/colors';
import { NewChatScreen } from './NewChatScreen';

jest.mock('@hum/ui-components', () => ({
  useTheme: jest.fn(),
}));

const { useTheme } = jest.requireMock('@hum/ui-components') as {
  useTheme: jest.Mock;
};

const flattenStyle = (style: unknown): Record<string, unknown> => {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>(
      (acc, item) => ({ ...acc, ...flattenStyle(item) }),
      {},
    );
  }
  if (typeof style === 'object') {
    return style as Record<string, unknown>;
  }
  return { value: style };
};

describe('NewChatScreen', () => {
  beforeEach(() => {
    useTheme.mockReset();
  });

  it('displays the static title copy', () => {
    useTheme.mockReturnValue({ colors: themeColors.light });
    const { UNSAFE_getAllByType } = render(<NewChatScreen />);
    const [title] = UNSAFE_getAllByType(Text);
    expect(title.props.children).toBe('New Chat');
    expect(useTheme).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['light', themeColors.light],
    ['dark', themeColors.dark],
  ] as const)(
    'applies the %s theme foreground color to the title',
    (_label, colors) => {
      useTheme.mockReturnValue({ colors });
      const { UNSAFE_getAllByType } = render(<NewChatScreen />);
      const [title] = UNSAFE_getAllByType(Text);
      expect(flattenStyle(title.props.style)).toMatchObject({
        color: colors.foreground,
      });
    },
  );

  it('uses the container padding defined in the styles object', () => {
    useTheme.mockReturnValue({ colors: themeColors.light });
    const { UNSAFE_getAllByType } = render(<NewChatScreen />);
    const [container] = UNSAFE_getAllByType(View);
    expect(flattenStyle(container.props.style)).toMatchObject({ padding: 16 });
  });
});
