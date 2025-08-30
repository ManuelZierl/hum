import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { View } from 'react-native';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig,
} from '@hum/ui-components';

const config: ChartConfig = {
  visitors: { label: 'Visitors', color: '#FECA1A' },
};

const tooltipPayload = [
  {
    dataKey: 'visitors',
    name: 'Visitors',
    value: 100,
    color: '#FECA1A',
    payload: { visitors: 'visitors' },
  },
];

const legendPayload = [
  { dataKey: 'visitors', value: 'Visitors', color: '#FECA1A' },
];

const ExampleChart: React.FC<{
  indicator?: 'dot' | 'line' | 'dashed';
  hideLabel?: boolean;
}> = ({ indicator = 'dot', hideLabel = false }) => (
  <ChartContainer
    config={config}
    // eslint-disable-next-line react-native/no-inline-styles
    style={{ width: 300, height: 200 }}
  >
    {/* eslint-disable-next-line react-native/no-inline-styles */}
    <View style={{ flex: 1 }} />
    <ChartTooltipContent
      active
      payload={tooltipPayload}
      indicator={indicator}
      hideLabel={hideLabel}
    />
    <ChartLegendContent payload={legendPayload} />
  </ChartContainer>
);

const meta: Meta<typeof ExampleChart> = {
  title: 'Components/Chart',
  component: ExampleChart,
  argTypes: {
    indicator: { control: 'select', options: ['dot', 'line', 'dashed'] },
    hideLabel: { control: 'boolean' },
  },
  args: {
    indicator: 'dot',
    hideLabel: false,
  },
};
export default meta;

type Story = StoryObj<typeof ExampleChart>;

export const Default: Story = {};
export const LineIndicator: Story = { args: { indicator: 'line' } };
export const DashedIndicator: Story = { args: { indicator: 'dashed' } };
