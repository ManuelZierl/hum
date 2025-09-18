import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const pressableStyles: Array<
  (state: { pressed: boolean }) => Array<Record<string, unknown> | number>
> = [];

jest.mock('react-native', () => {
  const actual =
    jest.requireActual<typeof import('react-native')>('react-native');
  type PressableProps = React.ComponentProps<typeof actual.Pressable>;

  const CapturingPressable = React.forwardRef<unknown, PressableProps>(
    ({ style, ...rest }, ref) => {
      if (typeof style === 'function') {
        pressableStyles.push(style);
      }

      return <actual.Pressable ref={ref} style={style} {...rest} />;
    },
  );
  CapturingPressable.displayName = 'CapturingPressable';

  return {
    ...actual,
    Pressable: CapturingPressable,
  };
});

import { ListRow, type ListRowProps } from './list-row';
import { ThemeProvider } from './theme/theme-provider';
import { Icon } from './theme/icon';
import { colors } from './theme/colors';
import { spacing } from './theme/spacing';
import { type as typography } from './theme/typography';

const baseProps: ListRowProps = {
  label: 'Archiviert',
  rightText: '5',
  icon: <Icon name="box" />,
};

type Scheme = 'light' | 'dark';

function renderRow(scheme: Scheme = 'light', props?: Partial<ListRowProps>) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <ListRow {...baseProps} {...props} />
    </ThemeProvider>,
  );
}

describe('ListRow', () => {
  beforeEach(() => {
    pressableStyles.length = 0;
  });

  it('renders and matches snapshot', () => {
    const { toJSON } = renderRow();
    expect(toJSON()).toMatchSnapshot();
  });

  it('fires onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderRow('light', { onPress });
    const pressable = getByLabelText('Archiviert');
    expect(pressable.props.role).toBe('button');
    fireEvent.press(pressable);
    expect(onPress).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { UNSAFE_getByProps, rerender } = renderRow('light');
    const lightStyle = UNSAFE_getByProps({ children: 'Archiviert' }).props
      .style as Record<string, unknown>;
    expect(lightStyle).toMatchObject({ color: colors.light.foreground });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <ListRow {...baseProps} />
      </ThemeProvider>,
    );
    const darkStyle = UNSAFE_getByProps({ children: 'Archiviert' }).props
      .style as Record<string, unknown>;
    expect(darkStyle).toMatchObject({ color: colors.dark.foreground });
  });

  it('renders spacing and background colors based on press state', () => {
    renderRow();
    expect(pressableStyles).toHaveLength(1);
    const styleFn = pressableStyles[0]!;

    const unpressed = styleFn({ pressed: false });
    expect(unpressed[1]).toMatchObject({
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: 'transparent',
    });

    const pressed = styleFn({ pressed: true });
    expect(pressed[1]).toMatchObject({
      backgroundColor: colors.light.muted,
    });
  });

  it('omits optional elements when they are not provided', () => {
    const { getByLabelText } = renderRow('light', {
      icon: undefined,
      rightText: undefined,
    });
    const pressable = getByLabelText('Archiviert');
    const children = React.Children.toArray(pressable.props.children);
    expect(children).toHaveLength(1);

    const left = children[0] as React.ReactElement<{
      children?: React.ReactNode;
    }>;
    const leftChildren = React.Children.toArray(left.props.children);
    expect(leftChildren).toHaveLength(1);
  });

  it('applies theme typography to the right text when provided', () => {
    const { getByLabelText } = renderRow();
    const pressable = getByLabelText('Archiviert');
    const children = React.Children.toArray(
      pressable.props.children,
    ) as React.ReactElement[];
    const rightText = children[1] as React.ReactElement<{
      style: Record<string, unknown>;
    }>;
    expect(rightText.props.style).toMatchObject({
      color: colors.light.mutedForeground,
      fontSize: typography.size.sm,
    });
  });
});
