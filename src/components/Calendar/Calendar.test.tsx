import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Calendar } from './Calendar';

const fullDate = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

const monthTitle = (date: Date) => new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date);

const weekdayShort = (date: Date) => new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date);

const dayOf = (onChange: ReturnType<typeof vi.fn>) => {
  const date = onChange.mock.calls[0][0] as Date;

  return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
};

describe('<Calendar />', () => {
  const user = userEvent.setup();

  it('should render the month-year title and a 6x7 day grid', () => {
    render(<Calendar defaultValue={new Date(2026, 0, 15)} />);

    expect(screen.getByText(monthTitle(new Date(2026, 0, 1)))).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
  });

  it('should mark the controlled value as selected', () => {
    render(<Calendar value={new Date(2026, 0, 15)} />);

    const selected = screen.getByRole('gridcell', { selected: true });
    expect(selected.querySelector('button')).toHaveAttribute('aria-label', fullDate(new Date(2026, 0, 15)));
  });

  it('should mark the defaultValue as selected when uncontrolled', () => {
    render(<Calendar defaultValue={new Date(2026, 2, 10)} />);

    const selected = screen.getByRole('gridcell', { selected: true });
    expect(selected.querySelector('button')).toHaveAttribute('aria-label', fullDate(new Date(2026, 2, 10)));
  });

  it('should call onChange with the clicked date', async () => {
    const onChange = vi.fn();
    render(<Calendar defaultValue={new Date(2026, 0, 1)} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: fullDate(new Date(2026, 0, 15)) }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(dayOf(onChange)).toEqual({ year: 2026, month: 0, day: 15 });
  });

  it('should select outside-month days and keep them dimmed', async () => {
    const onChange = vi.fn();
    render(<Calendar defaultValue={new Date(2026, 0, 15)} onChange={onChange} />);

    const outside = screen.getByRole('button', { name: fullDate(new Date(2026, 1, 1)) });
    expect(outside).toHaveClass('ore-calendar__day--outside');

    await user.click(outside);
    expect(dayOf(onChange)).toEqual({ year: 2026, month: 1, day: 1 });
  });

  it('should navigate to the previous and next month via the header buttons', async () => {
    render(<Calendar defaultValue={new Date(2026, 0, 15)} />);

    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByText(monthTitle(new Date(2025, 11, 1)))).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText(monthTitle(new Date(2026, 0, 1)))).toBeInTheDocument();
  });

  it('should keep the controlled month on screen and report onMonthChange', async () => {
    const onMonthChange = vi.fn();
    render(<Calendar month={new Date(2026, 0, 15)} onMonthChange={onMonthChange} />);

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(screen.getByText(monthTitle(new Date(2026, 0, 1)))).toBeInTheDocument();
    expect(onMonthChange).toHaveBeenCalledTimes(1);
    expect(dayOf(onMonthChange)).toEqual({ year: 2026, month: 1, day: 1 });
  });

  it('should start the weekday row on Monday or Sunday per weekStartsOn', () => {
    const monday = render(<Calendar defaultValue={new Date(2026, 0, 15)} weekStartsOn={1} />);
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent(weekdayShort(new Date(2026, 0, 5)));
    monday.unmount();

    render(<Calendar defaultValue={new Date(2026, 0, 15)} weekStartsOn={0} />);
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent(weekdayShort(new Date(2026, 0, 4)));
  });

  it('should mark today with aria-current="date"', () => {
    const today = new Date();
    render(<Calendar month={today} />);

    expect(screen.getByRole('button', { name: fullDate(today) })).toHaveAttribute('aria-current', 'date');
  });

  it('should move aria-selected to the clicked day', async () => {
    const onChange = vi.fn();
    render(<Calendar defaultValue={new Date(2026, 2, 10)} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: fullDate(new Date(2026, 2, 20)) }));

    const selected = screen.getAllByRole('gridcell', { selected: true });
    expect(selected).toHaveLength(1);
    expect(selected[0].querySelector('button')).toHaveAttribute('aria-label', fullDate(new Date(2026, 2, 20)));
  });

  it('should move focus with ArrowRight, ArrowDown and ArrowLeft without changing the selection', async () => {
    const onChange = vi.fn();
    render(<Calendar defaultValue={new Date(2026, 0, 15)} onChange={onChange} />);

    screen.getByRole('button', { name: fullDate(new Date(2026, 0, 15)) }).focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toHaveAttribute('aria-label', fullDate(new Date(2026, 0, 16)));

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toHaveAttribute('aria-label', fullDate(new Date(2026, 0, 23)));

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toHaveAttribute('aria-label', fullDate(new Date(2026, 0, 22)));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should page to the adjacent month when keyboard focus crosses the month edge', async () => {
    const onMonthChange = vi.fn();
    render(<Calendar defaultValue={new Date(2026, 0, 31)} onMonthChange={onMonthChange} />);

    screen.getByRole('button', { name: fullDate(new Date(2026, 0, 31)) }).focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toHaveAttribute('aria-label', fullDate(new Date(2026, 1, 1)));
    expect(screen.getByText(monthTitle(new Date(2026, 1, 1)))).toBeInTheDocument();
    expect(dayOf(onMonthChange)).toEqual({ year: 2026, month: 1, day: 1 });

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toHaveAttribute('aria-label', fullDate(new Date(2026, 0, 31)));
    expect(screen.getByText(monthTitle(new Date(2026, 0, 1)))).toBeInTheDocument();
  });

  it('should jump to the first and last day of the week with Home and End', async () => {
    render(<Calendar defaultValue={new Date(2026, 0, 15)} />);

    screen.getByRole('button', { name: fullDate(new Date(2026, 0, 15)) }).focus();
    await user.keyboard('{Home}');
    expect(document.activeElement).toHaveAttribute('aria-label', fullDate(new Date(2026, 0, 12)));

    await user.keyboard('{End}');
    expect(document.activeElement).toHaveAttribute('aria-label', fullDate(new Date(2026, 0, 18)));
  });

  it('should merge the custom className with the ore-calendar class', () => {
    const { container } = render(<Calendar className="custom-class" />);

    expect(container.firstChild).toHaveClass('ore-calendar', 'custom-class');
  });

  it('should forward extra props such as data-testid and aria-label', () => {
    render(<Calendar data-testid="calendar" aria-label="Choose a day" />);

    expect(screen.getByTestId('calendar')).toHaveAttribute('aria-label', 'Choose a day');
  });

  it('should forward style to the root element', () => {
    const { container } = render(<Calendar style={{ color: 'rgb(255, 0, 0)' }} />);

    expect(container.firstChild).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
