import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import renderer, { act } from 'react-test-renderer';

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

  it('renders spacing and background colors based on press state', async () => {
    let tree: ReturnType<typeof renderer.create> | undefined;
    await act(async () => {
      tree = renderer.create(
        <ThemeProvider forcedScheme="light">
          <ListRow {...baseProps} />
        </ThemeProvider>,
      );
    });

    const pressable = tree!.root.findByProps({
      accessibilityLabel: 'Archiviert',
    });
    const styleFn = pressable.props.style as (state: {
      pressed: boolean;
    }) => Array<Record<string, unknown> | number>;

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

    await act(async () => {
      tree!.unmount();
    });
  });

  it('omits optional elements when they are not provided', async () => {
    let tree: ReturnType<typeof renderer.create> | undefined;
    await act(async () => {
      tree = renderer.create(
        <ThemeProvider forcedScheme="light">
          <ListRow label="Archiviert" />
        </ThemeProvider>,
      );
    });

    const pressable = tree!.root.findByProps({
      accessibilityLabel: 'Archiviert',
    });
    const children = React.Children.toArray(pressable.props.children);
    expect(children).toHaveLength(1);

    const left = children[0] as React.ReactElement<{
      children?: React.ReactNode;
    }>;
    const leftChildren = React.Children.toArray(left.props.children);
    expect(leftChildren).toHaveLength(1);

    await act(async () => {
      tree!.unmount();
    });
  });

  it('applies theme typography to the right text when provided', async () => {
    let tree: ReturnType<typeof renderer.create> | undefined;
    await act(async () => {
      tree = renderer.create(
        <ThemeProvider forcedScheme="light">
          <ListRow {...baseProps} />
        </ThemeProvider>,
      );
    });

    const pressable = tree!.root.findByProps({
      accessibilityLabel: 'Archiviert',
    });
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

    await act(async () => {
      tree!.unmount();
    });
  });
});
