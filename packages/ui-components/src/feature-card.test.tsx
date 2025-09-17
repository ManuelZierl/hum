import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react';

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
  testID: 'feature-card',
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
    renderCard();
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('applies theme colors', () => {
    const { rerender } = renderCard('light');
    expect(screen.getByText('Test Feature')).toHaveStyle({
      color: 'rgba(10,10,10,1.00)',
    });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <FeatureCard {...baseProps} />
      </ThemeProvider>,
    );
    expect(screen.getByText('Test Feature')).toHaveStyle({
      color: 'rgba(250,250,250,1.00)',
    });
  });
});
