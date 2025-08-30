import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Text } from 'react-native';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  type AlertDialogProps,
} from '@hum/ui-components';

const ExampleAlertDialog: React.FC<AlertDialogProps> = (props) => (
  <AlertDialog {...props}>
    <AlertDialogTrigger>
      <Text>Open</Text>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          <Text>Are you sure?</Text>
        </AlertDialogTitle>
        <AlertDialogDescription>
          <Text>This action cannot be undone.</Text>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>
          <Text>Cancel</Text>
        </AlertDialogCancel>
        <AlertDialogAction>
          <Text>Continue</Text>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const meta: Meta<typeof ExampleAlertDialog> = {
  title: 'Components/AlertDialog',
  component: ExampleAlertDialog,
  argTypes: {
    defaultOpen: { control: 'boolean' },
    open: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof ExampleAlertDialog>;

export const Basic: Story = {};
export const Opened: Story = { args: { defaultOpen: true } };
export const Controlled: Story = {
  render: (args) => {
    const ControlledExample: React.FC = () => {
      const [open, setOpen] = React.useState(false);
      return (
        <ExampleAlertDialog {...args} open={open} onOpenChange={setOpen} />
      );
    };
    return <ControlledExample />;
  },
};
