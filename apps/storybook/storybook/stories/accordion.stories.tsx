import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Text } from 'react-native';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionProps,
} from '@hum/ui-components';

const ExampleAccordion: React.FC<AccordionProps> = (props) => (
  <Accordion {...props}>
    <AccordionItem value="item1">
      <AccordionTrigger>
        <Text>Item 1</Text>
      </AccordionTrigger>
      <AccordionContent>
        <Text>Content 1</Text>
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item2">
      <AccordionTrigger>
        <Text>Item 2</Text>
      </AccordionTrigger>
      <AccordionContent>
        <Text>Content 2</Text>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

const meta: Meta<typeof ExampleAccordion> = {
  title: 'Components/Accordion',
  component: ExampleAccordion,
  argTypes: {
    type: { control: { type: 'select', options: ['single', 'multiple'] } },
  },
  args: { type: 'single' },
};
export default meta;

type Story = StoryObj<typeof ExampleAccordion>;

export const Basic: Story = {};
export const Multiple: Story = { args: { type: 'multiple' } };
export const Controlled: Story = {
  render: (args) => {
    const ControlledAccordion: React.FC = () => {
      const [value, setValue] = React.useState<string | string[] | undefined>(
        'item1',
      );
      return (
        <ExampleAccordion {...args} value={value} onValueChange={setValue} />
      );
    };
    return <ControlledAccordion />;
  },
};
