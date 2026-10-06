import {
  type FC,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import cx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useOreLabels } from '../ThemeProvider';
import './Calendar.scss';

const GRID_SIZE = 42;
const DAYS_PER_WEEK = 7;

const titleFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const weekdayLongFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const addDays = (date: Date, amount: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

const daysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isSameMonth = (a: Date, b: Date): boolean => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const dateKey = (date: Date): string => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const startOfWeek = (date: Date, weekStartsOn: 0 | 1): Date =>
  addDays(date, -((date.getDay() - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK));

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Currently selected date (controlled). */
  value?: Date;
  /** Initially selected date when uncontrolled. */
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  /** Displayed month (controlled); any day of the month may be given. */
  month?: Date;
  /** Displayed month when uncontrolled; falls back to value/defaultValue/today. */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** First day of the week; 0 for Sunday, 1 for Monday (the GNOME convention). */
  weekStartsOn?: 0 | 1;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Calendar — a month grid following the GNOME HIG / GtkCalendar pattern: a
 * header with previous/next month navigation, a weekday row and a 6x7 day grid
 * with roving-tabindex keyboard navigation.
 */
export const Calendar: FC<CalendarProps> = ({
  value,
  defaultValue,
  onChange,
  month,
  defaultMonth,
  onMonthChange,
  weekStartsOn = 1,
  ref,
  className,
  style,
  ...rest
}) => {
  const labels = useOreLabels();
  const [internalValue, setInternalValue] = useState<Date | undefined>(defaultValue);
  const [internalMonth, setInternalMonth] = useState<Date>(() =>
    startOfMonth(defaultMonth ?? value ?? defaultValue ?? new Date()),
  );
  const [focusedDate, setFocusedDate] = useState<Date>(() => startOfDay(value ?? defaultValue ?? new Date()));

  const focusCellRef = useRef<HTMLButtonElement | null>(null);
  const pendingFocusRef = useRef(false);

  const activeMonth = month !== undefined ? startOfMonth(month) : internalMonth;
  const selectedDate = value !== undefined ? value : internalValue;

  const viewYear = activeMonth.getFullYear();
  const viewMonth = activeMonth.getMonth();

  const gridStart = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);

    return startOfWeek(first, weekStartsOn);
  }, [viewYear, viewMonth, weekStartsOn]);

  const weeks = useMemo(() => {
    return Array.from({ length: GRID_SIZE / DAYS_PER_WEEK }, (_, weekIndex) =>
      Array.from({ length: DAYS_PER_WEEK }, (_, dayIndex) => addDays(gridStart, weekIndex * DAYS_PER_WEEK + dayIndex)),
    );
  }, [gridStart]);

  const weekdays = useMemo(
    () => weeks[0].map((day) => ({ short: weekdayFormatter.format(day), long: weekdayLongFormatter.format(day) })),
    [weeks],
  );

  // The roving-tabindex cell: the focused date clamped into the displayed month.
  const focusCell = useMemo(() => {
    if (isSameMonth(focusedDate, activeMonth)) {
      return focusedDate;
    }

    return new Date(viewYear, viewMonth, Math.min(focusedDate.getDate(), daysInMonth(viewYear, viewMonth)));
  }, [focusedDate, activeMonth, viewYear, viewMonth]);

  // Restore DOM focus onto the roving cell after keyboard-driven month paging.
  useEffect(() => {
    if (!pendingFocusRef.current) {
      return;
    }
    pendingFocusRef.current = false;
    focusCellRef.current?.focus();
  });

  const commitMonth = useCallback(
    (next: Date) => {
      const normalized = startOfMonth(next);
      if (month === undefined) {
        setInternalMonth(normalized);
      }
      onMonthChange?.(normalized);
    },
    [month, onMonthChange],
  );

  const moveFocus = useCallback(
    (next: Date) => {
      pendingFocusRef.current = true;
      setFocusedDate(next);
      if (!isSameMonth(next, activeMonth)) {
        commitMonth(next);
      }
    },
    [activeMonth, commitMonth],
  );

  const shiftMonth = (delta: number) => {
    commitMonth(new Date(viewYear, viewMonth + delta, 1));
  };

  const selectDay = (date: Date) => {
    if (value === undefined) {
      setInternalValue(date);
    }
    onChange?.(date);
  };

  const handleGridKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: Date;
    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(focusedDate, -1);
        break;
      case 'ArrowRight':
        next = addDays(focusedDate, 1);
        break;
      case 'ArrowUp':
        next = addDays(focusedDate, -DAYS_PER_WEEK);
        break;
      case 'ArrowDown':
        next = addDays(focusedDate, DAYS_PER_WEEK);
        break;
      case 'Home':
        next = startOfWeek(focusedDate, weekStartsOn);
        break;
      case 'End':
        next = addDays(startOfWeek(focusedDate, weekStartsOn), DAYS_PER_WEEK - 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    moveFocus(next);
  };

  const today = startOfDay(new Date());
  const title = titleFormatter.format(activeMonth);

  return (
    <div
      {...rest}
      ref={ref}
      role="grid"
      tabIndex={-1}
      className={cx('ore-calendar', className)}
      style={style}
      onKeyDown={handleGridKeyDown}
    >
      <div role="presentation" className="ore-calendar__header">
        <button
          type="button"
          className="ore-calendar__nav"
          aria-label={labels.previousMonth}
          onClick={() => shiftMonth(-1)}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <div className="ore-calendar__title">{title}</div>
        <button type="button" className="ore-calendar__nav" aria-label={labels.nextMonth} onClick={() => shiftMonth(1)}>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>

      <div role="row" className="ore-calendar__week ore-calendar__week--weekdays">
        {weekdays.map((weekday) => (
          <div key={weekday.long} role="columnheader" aria-label={weekday.long} className="ore-calendar__weekday">
            {weekday.short}
          </div>
        ))}
      </div>

      {weeks.map((week) => (
        <div key={dateKey(week[0])} role="row" className="ore-calendar__week">
          {week.map((date) => {
            const outside = !isSameMonth(date, activeMonth);
            const isSelected = selectedDate !== undefined && isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            const isFocusCell = isSameDay(date, focusCell);

            return (
              <div key={dateKey(date)} role="gridcell" aria-selected={isSelected} className="ore-calendar__cell">
                <button
                  type="button"
                  ref={isFocusCell ? focusCellRef : undefined}
                  tabIndex={isFocusCell ? 0 : -1}
                  aria-label={fullDateFormatter.format(date)}
                  aria-current={isToday ? 'date' : undefined}
                  className={cx('ore-calendar__day', {
                    'ore-calendar__day--selected': isSelected,
                    'ore-calendar__day--today': isToday,
                    'ore-calendar__day--outside': outside,
                  })}
                  onFocus={() => setFocusedDate(date)}
                  onClick={() => selectDay(date)}
                >
                  {date.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
