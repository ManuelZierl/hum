import React from 'react';
import { Text, Pressable } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';

import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig,
} from './chart';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';

const config: ChartConfig = {
  visitors: { label: 'Visitors', color: colors.light.humPrimary },
};

const tooltipPayload = [
  {
    dataKey: 'visitors',
    name: 'Visitors',
    value: 100,
    color: colors.light.humPrimary,
    payload: { visitors: 'visitors' },
  },
];

const legendPayload = [
  { dataKey: 'visitors', value: 'Visitors', color: colors.light.humPrimary },
];

function renderTooltip(
  scheme: 'light' | 'dark' = 'light',
  props: Partial<React.ComponentProps<typeof ChartTooltipContent>> = {},
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <ChartContainer config={config}>
        <ChartTooltipContent
          active
          payload={tooltipPayload}
          testID="tooltip"
          {...props}
        />
      </ChartContainer>
    </ThemeProvider>,
  );
}

describe('ChartTooltipContent', () => {
  it('renders and matches snapshot', () => {
    const { toJSON } = renderTooltip();
    expect(toJSON()).toMatchSnapshot();
  });

  it('supports indicator variants', () => {
    const { getByLabelText, unmount } = renderTooltip('light', {
      indicator: 'line',
    });
    expect(getByLabelText('indicator-0')).toBeTruthy();
    unmount();
    const { getByLabelText: getByLabelText2 } = renderTooltip('light', {
      indicator: 'dashed',
    });
    expect(getByLabelText2('indicator-0')).toBeTruthy();
  });

  it('fires callbacks from formatter content', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderTooltip('light', {
      formatter: (value) => (
        <Pressable onPress={() => onPress(value)} accessibilityLabel="custom">
          <Text>{value}</Text>
        </Pressable>
      ),
    });
    fireEvent.press(getByLabelText('custom'));
    expect(onPress).toHaveBeenCalledWith(100);
  });

  it('is accessible and adapts to theme', () => {
    const { unmount, getByLabelText } = renderTooltip('light', {
      accessibilityLabel: 'tooltip',
    });
    const lightBg = getByLabelText('tooltip').props.style.backgroundColor;
    unmount();
    const { getByLabelText: getByLabelTextDark } = renderTooltip('dark', {
      accessibilityLabel: 'tooltip',
    });
    const darkBg = getByLabelTextDark('tooltip').props.style.backgroundColor;
    expect(lightBg).not.toBe(darkBg);
  });
});

describe('ChartLegendContent', () => {
  it('renders legend labels', () => {
    const { getByLabelText } = render(
      <ThemeProvider forcedScheme="light">
        <ChartContainer config={config}>
          <ChartLegendContent
            payload={legendPayload}
            accessibilityLabel="legend"
          />
        </ChartContainer>
      </ThemeProvider>,
    );
    expect(getByLabelText('legend')).toBeTruthy();
  });
});
