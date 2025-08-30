import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Text } from 'react-native';
import { FeatureCard, type FeatureCardProps } from './feature-card';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

type Scheme = 'light' | 'dark';

function renderCard(
  scheme: Scheme = 'light',
  props?: Partial<FeatureCardProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <FeatureCard
        icon={<Text>⭐</Text>}
        title="Title"
        description="Description"
        {...props}
      />
    </ThemeProvider>,
  );
}

describe('FeatureCard', () => {
  it('renders and matches snapshot', () => {
    const { container } = renderCard();
    expect(container).toMatchSnapshot();
  });

  it('applies theme styles', () => {
    const { getByTestId } = renderCard('dark');
    expect(getByTestId('feature-card')).toHaveStyle({
      backgroundColor: colors.dark.card,
    });
  });

  it('renders title and description', () => {
    const { getByText } = renderCard();
    expect(getByText('Title')).toBeTruthy();
    expect(getByText('Description')).toBeTruthy();
  });
});
