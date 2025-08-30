/* eslint-disable react-native/no-inline-styles, @typescript-eslint/no-explicit-any */
import React, { useContext, useMemo, useId } from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from './theme/ThemeProvider';

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
};

interface ChartContextProps {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextProps | null>(null);

export const useChart = () => {
  const ctx = useContext(ChartContext);
  if (!ctx) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return ctx;
};

export interface ChartContainerProps extends ViewProps {
  id?: string;
  config: ChartConfig;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  id,
  config,
  children,
  style,
  ...props
}) => {
  const uniqueId = useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <View
        accessibilityLabel={chartId}
        style={[styles.container, style]}
        {...props}
      >
        {children}
      </View>
    </ChartContext.Provider>
  );
};

export const ChartStyle: React.FC<{ id: string; config: ChartConfig }> = () =>
  null;
export const ChartTooltip: React.FC = () => null;
export const ChartLegend: React.FC = () => null;

export interface ChartTooltipContentProps extends ViewProps {
  active?: boolean;
  payload?: Array<Record<string, unknown>>;
  indicator?: 'line' | 'dot' | 'dashed';
  hideLabel?: boolean;
  hideIndicator?: boolean;
  label?: React.ReactNode;
  labelFormatter?: (
    label: React.ReactNode,
    payload?: Array<Record<string, unknown>>,
  ) => React.ReactNode;
  formatter?: (
    value: number,
    name: string,
    item: Record<string, unknown>,
    index: number,
    payloadItem: Record<string, unknown>,
  ) => React.ReactNode;
  color?: string;
  nameKey?: string;
  labelKey?: string;
}

export const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({
  active,
  payload,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  formatter,
  color,
  nameKey,
  labelKey,
  style,
  ...props
}) => {
  const { config } = useChart();
  const { colors, spacing, radius, type } = useTheme();

  const tooltipLabel = useMemo(() => {
    if (hideLabel || !payload?.length) return null;
    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === 'string'
        ? config[label]?.label || label
        : itemConfig?.label;

    if (!value && !labelFormatter) return null;
    const rendered = labelFormatter ? labelFormatter(value, payload) : value;
    return <Text style={{ fontWeight: type.weight.medium }}>{rendered}</Text>;
  }, [
    hideLabel,
    payload,
    labelKey,
    label,
    config,
    labelFormatter,
    type.weight.medium,
  ]);

  if (!active || !payload?.length) return null;

  const nestLabel = payload.length === 1 && indicator !== 'dot';

  return (
    <View
      testID={props.testID}
      accessible
      accessibilityRole="text"
      accessibilityLabel={props.accessibilityLabel || props.testID}
      style={[
        styles.tooltipContainer,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
          borderRadius: radius.md,
        },
        style,
      ]}
      {...props}
    >
      {!nestLabel && tooltipLabel}
      <View style={{ marginTop: spacing.xs }}>
        {payload.map((item, index) => {
          const key = `${nameKey || (item as any).name || (item as any).dataKey || 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor =
            color ||
            (item as any).payload?.fill ||
            (item as any).color ||
            colors.humPrimary;
          return (
            <View
              key={String((item as any).dataKey ?? index)}
              style={[
                styles.tooltipItem,
                indicator === 'dot' && styles.tooltipItemDot,
              ]}
            >
              {formatter &&
              (item as any)?.value !== undefined &&
              (item as any).name ? (
                formatter(
                  (item as any).value as number,
                  (item as any).name as string,
                  item as Record<string, unknown>,
                  index,
                  (item as any).payload as Record<string, unknown>,
                )
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <View
                        accessibilityLabel={`indicator-${index}`}
                        style={[
                          styles.indicator,
                          indicator === 'line' && styles.indicatorLine,
                          indicator === 'dashed' && styles.indicatorDashed,
                          nestLabel &&
                            indicator === 'dashed' && { marginVertical: 2 },
                          {
                            backgroundColor:
                              indicator === 'dashed'
                                ? 'transparent'
                                : indicatorColor,
                            borderColor: indicatorColor,
                          },
                        ]}
                      />
                    )
                  )}
                  <View
                    style={[
                      styles.itemContent,
                      nestLabel && styles.itemContentNest,
                    ]}
                  >
                    <View style={styles.itemLabels}>
                      {nestLabel && tooltipLabel}
                      <Text
                        style={{
                          color: colors.mutedForeground,
                          fontSize: type.size.sm,
                        }}
                      >
                        {itemConfig?.label || (item as any).name}
                      </Text>
                    </View>
                    {(item as any).value !== undefined && (
                      <Text
                        style={{
                          color: colors.foreground,
                          fontSize: type.size.sm,
                          fontWeight: type.weight.medium,
                          fontFamily: 'monospace',
                        }}
                      >
                        {typeof (item as any).value === 'number'
                          ? ((item as any).value as number).toLocaleString()
                          : (item as any).value}
                      </Text>
                    )}
                  </View>
                </>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export interface ChartLegendContentProps extends ViewProps {
  hideIcon?: boolean;
  payload?: Array<Record<string, unknown>>;
  verticalAlign?: 'top' | 'bottom';
  nameKey?: string;
}

export const ChartLegendContent: React.FC<ChartLegendContentProps> = ({
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
  style,
  ...props
}) => {
  const { config } = useChart();
  const { colors, spacing, type } = useTheme();

  if (!payload?.length) return null;

  return (
    <View
      accessibilityLabel={props.accessibilityLabel}
      style={[
        styles.legendContainer,
        verticalAlign === 'top'
          ? { paddingBottom: spacing.md }
          : { paddingTop: spacing.md },
        style,
      ]}
      {...props}
    >
      {payload.map((item, index) => {
        const key = `${nameKey || (item as any).dataKey || 'value'}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        const itemColor =
          typeof (item as any).color === 'string'
            ? ((item as any).color as string)
            : undefined;
        return (
          <View
            key={String((item as any).value ?? index)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: spacing.sm,
            }}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <View
                style={[
                  styles.legendIndicator,
                  { backgroundColor: itemColor || colors.humPrimary },
                ]}
              />
            )}
            <Text style={{ color: colors.foreground, fontSize: type.size.sm }}>
              {itemConfig?.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const payloadPayload =
    'payload' in payload && typeof (payload as any).payload === 'object'
      ? (payload as any).payload
      : undefined;

  let configLabelKey: string = key;

  if (key in (payload as any) && typeof (payload as any)[key] === 'string') {
    configLabelKey = (payload as any)[key] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === 'string'
  ) {
    configLabelKey = payloadPayload[key];
  }

  return configLabelKey in config
    ? (config as any)[configLabelKey]
    : (config as any)[key];
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 16 / 9,
    justifyContent: 'center',
  },
  tooltipContainer: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tooltipItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 4,
  },
  tooltipItemDot: {
    alignItems: 'center',
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 1,
    marginRight: 8,
  },
  indicatorLine: {
    width: 4,
  },
  indicatorDashed: {
    width: 0,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContentNest: {
    alignItems: 'flex-end',
  },
  itemLabels: {
    flexShrink: 1,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 2,
    marginRight: 6,
  },
});
