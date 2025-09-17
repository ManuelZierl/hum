import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { ThemeProvider } from './theme/theme-provider';
import { ContactInline } from './contact-inline';

describe('ContactInline', () => {
  function renderCI(online?: boolean) {
    return render(
      <ThemeProvider forcedScheme="light">
        <ContactInline name="Alice" online={online} />
      </ThemeProvider>,
    );
  }

  it('renders name', () => {
    const { toJSON } = renderCI();
    expect(toJSON()).toMatchSnapshot();
  });

  it('shows online dot when online', () => {
    const { UNSAFE_getAllByType } = renderCI(true);
    const views = UNSAFE_getAllByType(View);
    const dot = views.find((v) => v.props?.testID === 'online-dot');
    expect(dot).toBeTruthy();
  });
});
