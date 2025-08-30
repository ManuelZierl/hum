import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@hum/ui-components';
import { Text } from 'react-native';

interface ExampleProps {
  secondLabel: string;
}

const ExampleBreadcrumb: React.FC<ExampleProps> = ({ secondLabel }) => (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink onPress={() => {}}>
          <Text>Home</Text>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink onPress={() => {}}>
          <Text>{secondLabel}</Text>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>
          <Text>Current</Text>
        </BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);

const meta: Meta<typeof ExampleBreadcrumb> = {
  title: 'Components/Breadcrumb',
  component: ExampleBreadcrumb,
  argTypes: {
    secondLabel: { control: 'text' },
  },
  args: {
    secondLabel: 'Projects',
  },
};
export default meta;

type Story = StoryObj<typeof ExampleBreadcrumb>;

export const Basic: Story = {};

export const WithEllipsis: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink onPress={() => {}}>
            <Text>Home</Text>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            <Text>Current</Text>
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink onPress={() => {}}>
            <Text>Home</Text>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Text>/</Text>
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink onPress={() => {}}>
            <Text>Library</Text>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Text>/</Text>
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>
            <Text>Page</Text>
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
