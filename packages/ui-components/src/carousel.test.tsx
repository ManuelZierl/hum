import React from 'react';
import { Text, PressableProps } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselProps,
  type CarouselApi,
} from './carousel';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';

const hexToRgba = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},1.00)`;
};

function renderCarousel(
  scheme: 'light' | 'dark' = 'light',
  props?: Partial<CarouselProps>,
  nextProps?: Partial<PressableProps>,
  prevProps?: Partial<PressableProps>,
) {
  let api: CarouselApi | undefined;
  const setApi = (a: CarouselApi) => {
    api = a;
  };
  const utils = render(
    <ThemeProvider forcedScheme={scheme}>
      <Carousel setApi={setApi} {...props}>
        <CarouselContent>
          <CarouselItem>
            <Text>Slide 1</Text>
          </CarouselItem>
          <CarouselItem>
            <Text>Slide 2</Text>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious {...prevProps} />
        <CarouselNext {...nextProps} />
      </Carousel>
    </ThemeProvider>,
  );
  return { ...utils, api: api! };
}

describe('Carousel', () => {
  it('renders and matches snapshot', () => {
    const { toJSON } = renderCarousel();
    expect(toJSON()).toMatchSnapshot();
  });

  it('next button triggers onPress callback', () => {
    const onPress = jest.fn();
    renderCarousel('light', {}, { onPress });
    fireEvent.press(screen.getByLabelText('Next slide'));
    expect(onPress).toHaveBeenCalled();
  });

  it('previous button disabled initially', () => {
    renderCarousel();
    const prev = screen.getByLabelText('Previous slide');
    expect(prev).toBeDisabled();
  });

  it('applies theme colors', () => {
    const { unmount } = renderCarousel('light');
    expect(screen.getByLabelText('Next slide')).toHaveStyle({
      backgroundColor: hexToRgba(colors.light.humPrimary),
    });
    unmount();
    renderCarousel('dark');
    expect(screen.getByLabelText('Next slide')).toHaveStyle({
      backgroundColor: hexToRgba(colors.dark.humPrimary),
    });
  });
});
