import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Text } from 'react-native';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  type AlertProps,
} from '@hum/ui-components';

const ExampleAlert: React.FC<AlertProps> = (props) => (
  <Alert {...props}>
    <AlertTitle>
      <Text>Heads up!</Text>
    </AlertTitle>
    <AlertDescription>
      <Text>This is an alert.</Text>
    </AlertDescription>
  </Alert>
);

const meta: Meta<typeof ExampleAlert> = {
  title: 'Components/Alert',
  component: ExampleAlert,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
    },
  },
  args: { variant: 'default' },
};
export default meta;

type Story = StoryObj<typeof ExampleAlert>;

export const Basic: Story = {};
export const Destructive: Story = { args: { variant: 'destructive' } };
export const WithIcon: Story = {
  render: (args) => (
    <Alert {...args}>
      <Text>⚠️</Text>
      <AlertTitle>
        <Text>Heads up!</Text>
      </AlertTitle>
      <AlertDescription>
        <Text>This alert has an icon.</Text>
      </AlertDescription>
    </Alert>
  ),
};
