import React from 'react';
import { render } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { ThemeProvider } from './theme/ThemeProvider';
import { ContactInline } from './people/ContactInline';

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
    const { toJSON } = renderCI(true);
    const tree = toJSON() as unknown as { children?: unknown[] };
    expect((tree.children ?? []).length).toBe(2);
  });
});
