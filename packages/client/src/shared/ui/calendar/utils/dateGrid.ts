import {
  addDays,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export interface CalendarDay {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export const buildMonthGrid = (monthAnchor: Date): CalendarDay[] => {
  const firstOfMonth = startOfMonth(monthAnchor);
  const lastOfMonth = endOfMonth(monthAnchor);
  const gridStart = startOfWeek(firstOfMonth, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(lastOfMonth, { weekStartsOn: 0 });

  const days: CalendarDay[] = [];
  let cursor = gridStart;

  while (cursor <= gridEnd) {
    days.push({
      date: cursor,
      key: cursor.toISOString(),
      isCurrentMonth: isSameMonth(cursor, monthAnchor),
      isToday: isToday(cursor),
    });
    cursor = addDays(cursor, 1);
  }

  return days;
};

export const chunkIntoWeeks = (days: CalendarDay[]): CalendarDay[][] => {
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
};

export const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_SHORT_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
