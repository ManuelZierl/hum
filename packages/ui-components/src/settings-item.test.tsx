import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import { SettingsItem, type SettingsItemProps } from './settings-item';
import { ThemeProvider } from './theme/theme-provider';
import { Icon } from './theme/icon';

const baseProps: SettingsItemProps = {
  icon: <Icon name="person" />,
  title: 'Account',
  subtitle: 'Manage your account',
};

type Scheme = 'light' | 'dark';

function renderItem(
  scheme: Scheme = 'light',
  props?: Partial<SettingsItemProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <SettingsItem {...baseProps} {...props} />
    </ThemeProvider>,
  );
}

describe('SettingsItem', () => {
  it('renders and matches snapshot', () => {
    const { asFragment } = renderItem();
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderItem('light', { onPress });
    fireEvent.click(getByLabelText('Account'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders in both themes', () => {
    const { rerender } = renderItem('light');
    rerender(
      <ThemeProvider forcedScheme="dark">
        <SettingsItem {...baseProps} />
      </ThemeProvider>,
    );
  });
});
