import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const baseTypography = {
  size: { sm: 12, base: 15, md: 16, lg: 18, xl: 20, '2xl': 24 } as const,
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
  lineHeight: { snug: 18, normal: 20, relaxed: 24 } as const,
};

const scaleNumeric = <T extends Record<string, number>>(
  values: T,
  scale: number,
): T => {
  const result: Record<keyof T, number> = {} as Record<keyof T, number>;
  (Object.keys(values) as Array<keyof T>).forEach((key) => {
    const scaled = Math.round(values[key] * scale);
    result[key] = scaled;
  });
  return result as T;
};

type SizeTokens = keyof typeof baseTypography.size;
type LineHeightTokens = keyof typeof baseTypography.lineHeight;

export type TypographyDefinition = {
  size: Record<SizeTokens, number>;
  weight: typeof baseTypography.weight;
  lineHeight: Record<LineHeightTokens, number>;
};

const createTypography = (scale: number): TypographyDefinition => ({
  size: scaleNumeric(baseTypography.size, scale),
  weight: baseTypography.weight,
  lineHeight: scaleNumeric(baseTypography.lineHeight, scale),
});

export type TypographyScaleOption = {
  id: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  multiplier: number;
  labelKey: string;
};

export const TYPOGRAPHY_SCALE_OPTIONS: ReadonlyArray<TypographyScaleOption> = [
  { id: 'xs', multiplier: 0.85, labelKey: 'text_size.extra_small' },
  { id: 'sm', multiplier: 0.95, labelKey: 'text_size.small' },
  { id: 'md', multiplier: 1, labelKey: 'text_size.default' },
  { id: 'lg', multiplier: 1.1, labelKey: 'text_size.large' },
  { id: 'xl', multiplier: 1.25, labelKey: 'text_size.extra_large' },
];

const DEFAULT_SCALE_INDEX = TYPOGRAPHY_SCALE_OPTIONS.findIndex(
  (option) => option.id === 'md',
);

const fallbackScaleIndex = DEFAULT_SCALE_INDEX === -1 ? 0 : DEFAULT_SCALE_INDEX;

const clampScaleIndex = (value: number) => {
  const rounded = Number.isFinite(value)
    ? Math.round(value)
    : fallbackScaleIndex;
  const max = TYPOGRAPHY_SCALE_OPTIONS.length - 1;
  if (rounded < 0) return 0;
  if (rounded > max) return max;
  return rounded;
};

const defaultPreset = TYPOGRAPHY_SCALE_OPTIONS[fallbackScaleIndex];

export const type = createTypography(defaultPreset.multiplier);

export type TypographyContextValue = {
  type: TypographyDefinition;
  scaleIndex: number;
  scale: number;
  preset: TypographyScaleOption;
  presets: ReadonlyArray<TypographyScaleOption>;
  setScaleIndex: (value: number) => void;
};

const defaultContext: TypographyContextValue = {
  type,
  scaleIndex: fallbackScaleIndex,
  scale: defaultPreset.multiplier,
  preset: defaultPreset,
  presets: TYPOGRAPHY_SCALE_OPTIONS,
  setScaleIndex: () => {
    // Intentionally empty: allows use outside provider without crashing during tests.
  },
};

const TypographyContext = createContext<TypographyContextValue>(defaultContext);

export interface TypographyProviderProps {
  children: React.ReactNode;
  initialScaleIndex?: number;
  onScaleIndexChange?: (index: number, option: TypographyScaleOption) => void;
}

export const TypographyProvider: React.FC<TypographyProviderProps> = ({
  children,
  initialScaleIndex,
  onScaleIndexChange,
}) => {
  const [scaleIndex, setScaleIndexState] = useState(() =>
    clampScaleIndex(initialScaleIndex ?? fallbackScaleIndex),
  );

  useEffect(() => {
    if (typeof initialScaleIndex === 'number') {
      setScaleIndexState(clampScaleIndex(initialScaleIndex));
    }
  }, [initialScaleIndex]);

  const handleScaleIndexChange = useCallback(
    (nextIndex: number) => {
      const clamped = clampScaleIndex(nextIndex);
      setScaleIndexState((current) => {
        if (current === clamped) return current;
        if (onScaleIndexChange) {
          onScaleIndexChange(clamped, TYPOGRAPHY_SCALE_OPTIONS[clamped]);
        }
        return clamped;
      });
    },
    [onScaleIndexChange],
  );

  const preset =
    TYPOGRAPHY_SCALE_OPTIONS[scaleIndex] ??
    TYPOGRAPHY_SCALE_OPTIONS[fallbackScaleIndex];

  const computedTypography = useMemo(
    () => createTypography(preset.multiplier),
    [preset.multiplier],
  );

  const contextValue = useMemo<TypographyContextValue>(
    () => ({
      type: computedTypography,
      scaleIndex,
      scale: preset.multiplier,
      preset,
      presets: TYPOGRAPHY_SCALE_OPTIONS,
      setScaleIndex: handleScaleIndexChange,
    }),
    [computedTypography, handleScaleIndexChange, preset, scaleIndex],
  );

  return (
    <TypographyContext.Provider value={contextValue}>
      {children}
    </TypographyContext.Provider>
  );
};

export const useTypography = () => useContext(TypographyContext);

export const getTypographyForScale = (scale: number) => createTypography(scale);
