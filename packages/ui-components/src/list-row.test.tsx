import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ListRow, type ListRowProps } from './list-row';
import { ThemeProvider } from './theme/theme-provider';
import { Icon } from './theme/icon';

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
    const { asFragment } = renderRow();
    expect(asFragment()).toMatchSnapshot();
  });

  it('fires onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderRow('light', { onPress });
    fireEvent.click(getByLabelText('Archiviert'));
    expect(onPress).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { getByText, rerender } = renderRow('light');
    expect(getByText('Archiviert')).toHaveStyle({
      color: 'rgba(10,10,10,1.00)',
    });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <ListRow {...baseProps} />
      </ThemeProvider>,
    );
    expect(getByText('Archiviert')).toHaveStyle({
      color: 'rgba(250,250,250,1.00)',
    });
  });
});
