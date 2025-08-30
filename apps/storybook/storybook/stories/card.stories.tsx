import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@hum/ui-components';

interface ExampleCardProps {
  title: string;
  description: string;
  content: string;
}

const ExampleCard: React.FC<ExampleCardProps> = ({
  title,
  description,
  content,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>
        <Text>{title}</Text>
      </CardTitle>
      <CardDescription>
        <Text>{description}</Text>
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Text>{content}</Text>
    </CardContent>
  </Card>
);

const meta: Meta<typeof ExampleCard> = {
  title: 'Components/Card',
  component: ExampleCard,
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    content: { control: 'text' },
  },
  args: {
    title: 'Card Title',
    description: 'Card Description',
    content: 'This is some card content.',
  },
};
export default meta;

type Story = StoryObj<typeof ExampleCard>;

export const Basic: Story = {};

export const WithAction: Story = {
  render: (args) => (
    <Card>
      <CardHeader>
        <CardTitle>
          <Text>{args.title}</Text>
        </CardTitle>
        <CardDescription>
          <Text>{args.description}</Text>
        </CardDescription>
        <CardAction>
          <Pressable
            onPress={() => console.log('Pressed')}
            accessibilityRole="button"
          >
            <Text>Action</Text>
          </Pressable>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Text>{args.content}</Text>
      </CardContent>
      <CardFooter>
        <Text>Footer</Text>
      </CardFooter>
    </Card>
  ),
};

export const CustomStyle: Story = {
  render: (args) => (
    <Card style={styles.custom}>
      <CardHeader>
        <CardTitle>
          <Text>{args.title}</Text>
        </CardTitle>
        <CardDescription>
          <Text>{args.description}</Text>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Text>{args.content}</Text>
      </CardContent>
    </Card>
  ),
};

const styles = StyleSheet.create({
  custom: { borderWidth: 2 },
});
