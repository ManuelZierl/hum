import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { ListRow, type ListRowProps } from './list-row';
import { ThemeProvider } from './theme/theme-provider';
import { Icon } from './theme/icon';
import { colors } from './theme/colors';

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
    fireEvent.press(getByLabelText('Archiviert'));
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
});
