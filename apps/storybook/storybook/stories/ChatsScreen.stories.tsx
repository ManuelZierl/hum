import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chat, ChatsScreen } from '@hum/ui-screens';
import { ThemeProvider } from '@hum/ui-components';

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Mama Handy',
    message: 'Ich komm heute doch nicht zum Essen',
    time: '12:14',
    avatar:
      'https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFufGVufDF8fHx8MTc1NjQ4Nzc4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    isRead: true,
  },
  {
    id: '2',
    name: 'Lisa Sophia 💕💍 Ruland',
    message: 'Standort',
    time: 'Gestern',
    avatar:
      'https://images.unsplash.com/photo-1675705444858-97005ce93298?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU2NDg3Nzk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    hasLocation: true,
    hasHeart: true,
  },
  {
    id: '3',
    name: 'ConClimate/Substain 💚',
    message: '~ Emmi: Öffne diesen Link, um meiner WhatsApp-Gruppe beizut...',
    time: 'Montag',
    avatar:
      'https://images.unsplash.com/photo-1563481911853-c14860cd6947?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxidXNpbmVzcyUyMHRlYW0lMjBncm91cHxlbnwxfHx8fDE3NTY0ODc3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    isGroup: true,
  },
  {
    id: '4',
    name: 'Ursula Huber',
    message: '✓✓ Danke 😊 euch auch viel Spaß und liebe Grüße an alle :)',
    time: '20.08.25',
    avatar:
      'https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFufGVufDF8fHx8MTc1NjQ4Nzc4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    isRead: true,
  },
  {
    id: '5',
    name: 'Viki',
    message: 'Vielen Dank! Sehr lieb dass du an mich gedacht hast! 🌻🍃',
    time: '18.08.25',
    avatar:
      'https://images.unsplash.com/photo-1597202992582-9ee5c6672095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxjYXN1YWwlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTY0ODc4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: '6',
    name: '+964 789 058 3669',
    message: 'Hallo Binance-Nutzer! Das neueste DeFi-Chain-Airdrop-Update...',
    time: '16',
    avatar:
      'https://images.unsplash.com/photo-1719257751404-1dea075324bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMG1hbnxlbnwxfHx8fDE3NTY0NjA5ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    unreadCount: 1,
  },
  {
    id: '7',
    name: 'Work Team',
    message: 'Meeting postponed to 3 PM tomorrow',
    time: '14:30',
    avatar:
      'https://images.unsplash.com/photo-1563481911853-c14860cd6947?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxidXNpbmVzcyUyMHRlYW0lMjBncm91cHxlbnwxfHx8fDE3NTY0ODc3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    isGroup: true,
  },
  {
    id: '8',
    name: 'Sarah Johnson',
    message: 'Thanks for the coffee! ☕',
    time: '11:45',
    avatar:
      'https://images.unsplash.com/photo-1675705444858-97005ce93298?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU2NDg3Nzk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    isRead: true,
    unreadCount: 2,
  },
  {
    id: '9',
    name: 'Dad',
    message: "Don't forget about dinner Sunday",
    time: '09:22',
    avatar:
      'https://images.unsplash.com/photo-1719257751404-1dea075324bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMG1hbnxlbnwxfHx8fDE3NTY0NjA5ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: '10',
    name: 'Book Club 📚',
    message: 'Next meeting is about "The Midnight Library"',
    time: '08:15',
    avatar:
      'https://images.unsplash.com/photo-1563481911853-c14860cd6947?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxidXNpbmVzcyUyMHRlYW0lMjBncm91cHxlbnwxfHx8fDE3NTY0ODc3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    isGroup: true,
  },
  {
    id: '11',
    name: 'Mike Chen',
    message: 'Can you send me the project files?',
    time: 'Yesterday',
    avatar:
      'https://images.unsplash.com/photo-1597202992582-9ee5c6672095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxjYXN1YWwlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTY0ODc4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    unreadCount: 3,
  },
  {
    id: '12',
    name: 'Emma Wilson',
    message: 'Happy birthday! 🎉🎂',
    time: 'Yesterday',
    avatar:
      'https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFufGVufDF8fHx8MTc1NjQ4Nzc4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: '13',
    name: 'Gym Buddies 💪',
    message: "Who's up for leg day tomorrow?",
    time: 'Tuesday',
    avatar:
      'https://images.unsplash.com/photo-1563481911853-c14860cd6947?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxidXNpbmVzcyUyMHRlYW0lMjBncm91cHxlbnwxfHx8fDE3NTY0ODc3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    isGroup: true,
  },
  {
    id: '14',
    name: 'Alex Rodriguez',
    message: "Let's catch up soon!",
    time: 'Monday',
    avatar:
      'https://images.unsplash.com/photo-1719257751404-1dea075324bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMG1hbnxlbnwxfHx8fDE3NTY0NjA5ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: '15',
    name: 'Family Group',
    message: 'Mom: Planning for the holidays already!',
    time: 'Sunday',
    avatar:
      'https://images.unsplash.com/photo-1675705444858-97005ce93298?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU2NDg3Nzk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    isGroup: true,
  },
];

const meta: Meta<typeof ChatsScreen> = {
  title: 'Screens/ChatsScreen',
  component: ChatsScreen,
  argTypes: {
    onNavigateToChat: { action: 'navigate' },
  },
  args: {
    chats: mockChats,
  },
  decorators: [
    (StoryFn) => (
      <ThemeProvider forcedScheme="dark">
        <StoryFn />
      </ThemeProvider>
    ),
  ],
};

export default meta;

export type Story = StoryObj<typeof ChatsScreen>;

export const Default: Story = {};

export const Empty: Story = {
  args: { chats: [] },
};

export const LightMode: Story = {
  decorators: [
    (StoryFn) => (
      <ThemeProvider forcedScheme="light">
        <StoryFn />
      </ThemeProvider>
    ),
  ],
};

export const WithSearch: Story = {
  args: { showSearch: true },
};
