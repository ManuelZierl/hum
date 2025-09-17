import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react';

import { FeatureCard, type FeatureCardProps } from './feature-card';
import { ThemeProvider } from './theme/theme-provider';

const MockIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = 'black',
}) => <Text style={{ fontSize: size, color }}>I</Text>;

const baseProps: FeatureCardProps = {
  icon: <MockIcon />,
  title: 'Test Feature',
  description: 'Description',
};

type Scheme = 'light' | 'dark';

function renderCard(
  scheme: Scheme = 'light',
  props?: Partial<FeatureCardProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <FeatureCard {...baseProps} {...props} />
    </ThemeProvider>,
  );
}

describe('FeatureCard', () => {
  it('renders and matches snapshot', () => {
    const { asFragment } = renderCard();
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders title and description', () => {
    const { getByText } = renderCard();
    expect(getByText('Test Feature')).toBeInTheDocument();
    expect(getByText('Description')).toBeInTheDocument();
  });

  it('applies theme colors', () => {
    const { getByText, rerender } = renderCard('light');
    expect(getByText('Test Feature')).toHaveStyle({
      color: 'rgb(10, 10, 10)',
    });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <FeatureCard {...baseProps} />
      </ThemeProvider>,
    );
    expect(getByText('Test Feature')).toHaveStyle({
      color: 'rgb(250, 250, 250)',
    });
  });
});
