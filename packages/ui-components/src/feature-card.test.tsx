import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

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
    const { toJSON } = renderCard();
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders title and description', () => {
    const { UNSAFE_getAllByType } = renderCard();
    const { Text } = require('react-native');
    const texts = UNSAFE_getAllByType(Text);
    const hasTitle = texts.some((t: any) =>
      String(Array.isArray(t.props.children) ? t.props.children.join('') : t.props.children ?? '').includes('Test Feature'),
    );
    const hasDesc = texts.some((t: any) =>
      String(Array.isArray(t.props.children) ? t.props.children.join('') : t.props.children ?? '').includes('Description'),
    );
    expect(hasTitle).toBe(true);
    expect(hasDesc).toBe(true);
  });

  it('applies theme colors', () => {
    const { rerender, UNSAFE_getAllByType } = renderCard('light');
    const { Text } = require('react-native');
    const flatten = (s: any) => (Array.isArray(s) ? Object.assign({}, ...s) : s);
    const getTitle = () =>
      UNSAFE_getAllByType(Text).find((t: any) =>
        String(Array.isArray(t.props.children) ? t.props.children.join('') : t.props.children ?? '').includes('Test Feature'),
      );
    const title1 = getTitle()!;
    expect(String(flatten(title1.props.style).color).toUpperCase()).toBe('#0A0A0A');
    rerender(
      <ThemeProvider forcedScheme="dark">
        <FeatureCard {...baseProps} />
      </ThemeProvider>,
    );
    const title2 = getTitle()!;
    expect(String(flatten(title2.props.style).color).toUpperCase()).toBe('#FAFAFA');
  });
});
