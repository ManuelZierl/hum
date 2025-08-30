import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from './theme/ThemeProvider';

export interface Range {
  start?: Date;
  end?: Date;
}

export interface CalendarProps {
  mode?: 'single' | 'range';
  selected?: Date | Range;
  onSelect?: (value: Date | Range) => void;
  showOutsideDays?: boolean;
  style?: StyleProp<ViewStyle>;
  dayTextStyle?: StyleProp<TextStyle>;
  testID?: string;
}

interface DayInfo {
  date: Date | null;
  currentMonth: boolean;
}

const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const Calendar: React.FC<CalendarProps> = ({
  mode = 'single',
  selected,
  onSelect,
  showOutsideDays = true,
  style,
  dayTextStyle,
  testID,
}) => {
  const { colors, spacing, radius, type } = useTheme();
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState<Date>(
    selected instanceof Date ? selected : today,
  );

  const isControlled = selected !== undefined;
  const [internalSelected, setInternalSelected] = useState<
    Date | Range | undefined
  >();
  const current = (isControlled ? selected : internalSelected) as
    | Date
    | Range
    | undefined;

  const handleSelect = (date: Date) => {
    let next: Date | Range;
    if (mode === 'range') {
      const range = (current as Range) || {};
      if (!range.start || (range.start && range.end)) {
        next = { start: date };
      } else {
        next =
          date < range.start
            ? { start: date, end: range.start }
            : { start: range.start, end: date };
      }
    } else {
      next = date;
    }
    if (!isControlled) setInternalSelected(next);
    onSelect?.(next);
  };

  const days = useMemo(
    () => buildCalendar(month, showOutsideDays),
    [month, showOutsideDays],
  );

  const renderDay = (d: DayInfo, index: number) => {
    if (!d.date) {
      return <View key={index} style={styles.dayCell} />;
    }
    const out = !d.currentMonth;
    const sel =
      mode === 'range'
        ? isInRange(d.date, current as Range | undefined)
        : isSameDay(d.date, current as Date | undefined);
    const bg = sel ? colors.humPrimary : 'transparent';
    const textColor = sel
      ? colors.humPrimaryForeground
      : out
        ? colors.mutedForeground
        : colors.foreground;
    return (
      <Pressable
        key={index}
        onPress={() => handleSelect(d.date!)}
        accessibilityRole="button"
        accessibilityLabel={`Select ${d.date.getDate()}`}
        style={[
          styles.dayCell,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            backgroundColor: bg,
            borderRadius: radius.sm,
            opacity: out ? 0.4 : 1,
          },
        ]}
        testID={`day-${d.date.getDate()}`}
      >
        <Text
          style={[
            {
              color: textColor,
              fontSize: type.size.sm,
              fontWeight: type.weight.normal,
            },
            dayTextStyle,
          ]}
        >
          {String(d.date.getDate())}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={[styles.header, { marginBottom: spacing.sm }]}>
        <Pressable
          onPress={() => setMonth(addMonths(month, -1))}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          style={[styles.navButton, { padding: spacing.xs }]}
        >
          <Text style={{ color: colors.foreground, fontSize: type.size.md }}>
            {'\u2039'}
          </Text>
        </Pressable>
        <Text
          testID="month-label"
          style={{
            color: colors.foreground,
            fontSize: type.size.md,
            fontWeight: type.weight.medium,
          }}
        >
          {formatMonth(month)}
        </Text>
        <Pressable
          onPress={() => setMonth(addMonths(month, 1))}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          style={[styles.navButton, { padding: spacing.xs }]}
        >
          <Text style={{ color: colors.foreground, fontSize: type.size.md }}>
            {'\u203A'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.weekHeader}>
        {daysOfWeek.map((d) => (
          <Text
            key={d}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              flex: 1,
              textAlign: 'center',
              color: colors.mutedForeground,
              fontSize: type.size.sm,
              marginBottom: spacing.xs,
            }}
          >
            {d}
          </Text>
        ))}
      </View>

      {chunk(days, 7).map((week, idx) => (
        <View key={idx} style={styles.weekRow}>
          {week.map(renderDay)}
        </View>
      ))}
    </View>
  );
};

function buildCalendar(month: Date, showOutside: boolean): DayInfo[] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(year, m, 1);
  const firstDay = first.getDay();
  const days: DayInfo[] = [];
  const prevDays = new Date(year, m, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    if (showOutside) {
      days.push({
        date: new Date(year, m - 1, prevDays - firstDay + i + 1),
        currentMonth: false,
      });
    } else {
      days.push({ date: null, currentMonth: false });
    }
  }

  const monthDays = new Date(year, m + 1, 0).getDate();
  for (let i = 1; i <= monthDays; i++) {
    days.push({ date: new Date(year, m, i), currentMonth: true });
  }

  const remaining = 42 - days.length;
  for (let i = 0; i < remaining; i++) {
    if (showOutside) {
      days.push({ date: new Date(year, m + 1, i + 1), currentMonth: false });
    } else {
      days.push({ date: null, currentMonth: false });
    }
  }
  return days;
}

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
};

const addMonths = (date: Date, count: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + count);
  return d;
};

const formatMonth = (date: Date) =>
  date.toLocaleString('default', { month: 'long', year: 'numeric' });

const isSameDay = (a: Date, b?: Date) =>
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const atMidnight = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const isInRange = (d: Date, range?: Range): boolean => {
  if (!range || !range.start) return false;
  const start = atMidnight(range.start);
  const end = atMidnight(range.end ?? range.start);
  const time = atMidnight(d);
  return time >= start && time <= end;
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekHeader: {
    flexDirection: 'row',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
});

export default Calendar;
