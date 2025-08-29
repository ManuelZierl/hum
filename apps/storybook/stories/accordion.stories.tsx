import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from 'react-native';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionProps,
} from '../../packages/hum-ui-components/accordion';

type DemoProps = Omit<AccordionProps, 'children' | 'onValueChange' | 'style'>;

const AccordionDemo: React.FC<DemoProps> = (props) => {
  const [value, setValue] = useState(
    props.value ?? (props.type === 'multiple' ? [] : ''),
  );
  return (
    <Accordion {...props} value={value} onValueChange={setValue}>
      <AccordionItem value="item1">
        <AccordionTrigger>
          <Text>First Item</Text>
        </AccordionTrigger>
        <AccordionContent>
          <Text>Content for item one.</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>
          <Text>Second Item</Text>
        </AccordionTrigger>
        <AccordionContent>
          <Text>More content here.</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const meta: Meta<typeof AccordionDemo> = {
  title: 'Components/Accordion',
  component: AccordionDemo,
  argTypes: {
    type: { control: { type: 'select', options: ['single', 'multiple'] } },
    value: { control: 'object' },
  },
  args: { type: 'single' },
};
export default meta;

type Story = StoryObj<typeof AccordionDemo>;

export const Basic: Story = {};

export const Multiple: Story = {
  args: { type: 'multiple' },
};

export const PreOpen: Story = {
  args: { value: 'item2' },
};
