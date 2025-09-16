import React from 'react';
import { render, screen } from '@testing-library/react';
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
    const { asFragment } = renderCI();
    expect(asFragment()).toMatchSnapshot();
  });

  it('shows online dot when online', () => {
    renderCI(true);
    expect(screen.getByTestId('online-dot')).toBeInTheDocument();
  });
});
