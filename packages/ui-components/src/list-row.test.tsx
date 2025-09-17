import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import { ListRow, type ListRowProps } from './list-row';
import { ThemeProvider } from './theme/theme-provider';

const baseProps: ListRowProps = {
  label: 'Archiviert',
  rightText: '5',
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
    const { asFragment } = renderRow();
    expect(asFragment()).toMatchSnapshot();
  });

  it('fires onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = renderRow('light', { onPress });
    fireEvent.click(getByRole('button', { name: 'Archiviert' }));
    expect(onPress).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const light = renderRow('light');
    expect(light.getByText('Archiviert')).toHaveStyle({
      color: 'rgb(10, 10, 10)',
    });
    light.unmount();
    const dark = renderRow('dark');
    expect(dark.getByText('Archiviert')).toHaveStyle({
      color: 'rgb(250, 250, 250)',
    });
  });
});
