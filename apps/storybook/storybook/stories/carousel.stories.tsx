import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@hum/ui-components';
import type { CarouselProps } from '@hum/ui-components';

const styles = StyleSheet.create({
  slide: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FECA1A',
    borderRadius: 8,
    margin: 8,
  },
});

const Slide: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.slide}>
    <Text>{label}</Text>
  </View>
);

const ExampleCarousel: React.FC<CarouselProps> = (props) => (
  <Carousel {...props}>
    <CarouselContent>
      <CarouselItem>
        <Slide label="Slide 1" />
      </CarouselItem>
      <CarouselItem>
        <Slide label="Slide 2" />
      </CarouselItem>
      <CarouselItem>
        <Slide label="Slide 3" />
      </CarouselItem>
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
);

const meta: Meta<typeof ExampleCarousel> = {
  title: 'Components/Carousel',
  component: ExampleCarousel,
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
  args: { orientation: 'horizontal' },
};

export default meta;

type Story = StoryObj<typeof ExampleCarousel>;

export const Basic: Story = {};
export const Vertical: Story = { args: { orientation: 'vertical' } };
