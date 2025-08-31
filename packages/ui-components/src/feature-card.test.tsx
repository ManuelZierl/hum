/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';

import { FeatureCard, type FeatureCardProps } from './feature-card';
import { ThemeProvider } from './theme/ThemeProvider';

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
    const { toJSON } = renderCard();
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders title and description', () => {
    const { toJSON } = renderCard();
    const tree = toJSON() as any;
    expect(JSON.stringify(tree)).toContain('Test Feature');
    expect(JSON.stringify(tree)).toContain('Description');
  });

  it('applies theme colors', () => {
    const { toJSON, rerender } = renderCard('light');
    let tree = toJSON() as any;
    expect(tree.children[0].children[1].props.style).toMatchObject({
      color: 'rgba(10,10,10,1.00)',
    });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <FeatureCard {...baseProps} />
      </ThemeProvider>,
    );
    tree = toJSON() as any;
    expect(tree.children[0].children[1].props.style).toMatchObject({
      color: 'rgba(250,250,250,1.00)',
    });
  });
});
