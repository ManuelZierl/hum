import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  BottomNavigation,
  type BottomNavigationProps,
} from '@hum/ui-components';

const Wrapper: React.FC<BottomNavigationProps> = (props) => {
  const [active, setActive] = React.useState(props.activeTab);
  return (
    <BottomNavigation {...props} activeTab={active} onTabChange={setActive} />
  );
};

const meta: Meta<typeof Wrapper> = {
  title: 'Components/BottomNavigation',
  component: Wrapper,
  decorators: [
    (Story) => (
      <SafeAreaProvider>
        <Story />
      </SafeAreaProvider>
    ),
  ],
  argTypes: {
    chatsBadgeCount: { control: 'number' },
  },
  args: {
    activeTab: 'chats',
    chatsBadgeCount: 0,
  },
};
export default meta;

type Story = StoryObj<typeof Wrapper>;

export const Basic: Story = {};
export const WithBadge: Story = { args: { chatsBadgeCount: 5 } };
