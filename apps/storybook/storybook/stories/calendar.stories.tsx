import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Calendar, type CalendarProps } from '@hum/ui-components';

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  argTypes: {
    mode: { control: 'select', options: ['single', 'range'] },
    showOutsideDays: { control: 'boolean' },
  },
  args: { mode: 'single', showOutsideDays: true },
};
export default meta;

type Story = StoryObj<typeof Calendar>;

export const Basic: Story = {};
export const Range: Story = { args: { mode: 'range' } };
export const Controlled: Story = {
  render: (args: CalendarProps) => {
    const ControlledExample: React.FC = () => {
      const [value, setValue] = React.useState<
        Date | { start?: Date; end?: Date }
      >();
      return <Calendar {...args} selected={value} onSelect={setValue} />;
    };
    return <ControlledExample />;
  },
};
