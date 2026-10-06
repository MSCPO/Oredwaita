import { type FC, type HTMLAttributes, type Ref, useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cx from 'clsx';
import { Calendar as CalendarIcon } from 'lucide-react';

import { useAnchoredPosition } from '../../hooks/useAnchoredPosition';
import { useOverlayBehavior } from '../../hooks/useOverlayBehavior';
import { Calendar } from '../Calendar';
import { useOreLabels } from '../ThemeProvider';
import './DatePicker.scss';

const dateFormatter = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Currently selected date (controlled). */
  value?: Date;
  /** Initially selected date when uncontrolled. */
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  /** Trigger text shown when no date is selected; falls back to the localized pick-date label. */
  placeholder?: string;
  disabled?: boolean;
  ref?: Ref<HTMLDivElement>;
}

/**
 * DatePicker — a date entry control following the GNOME HIG / GtkDatePicker
 * pattern: a trigger button that opens a popover holding a GtkCalendar-style
 * month grid; picking a day reports it and dismisses the popover.
 */
export const DatePicker: FC<DatePickerProps> = ({
  value,
  defaultValue,
  onChange,
  placeholder,
  disabled = false,
  ref,
  className,
  style,
  ...rest
}) => {
  const labels = useOreLabels();
  const [internalValue, setInternalValue] = useState<Date | undefined>(defaultValue);
  const [open, setOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const { ref: popupRef, style: anchoredStyle } = useAnchoredPosition({
    anchorRef: triggerRef,
    placement: 'bottom',
    active: open,
  });

  const dialogId = useId();

  const currentDate = value !== undefined ? value : internalValue;
  const displayText = currentDate ? dateFormatter.format(currentDate) : (placeholder ?? labels.pickDate);

  const close = useCallback(() => setOpen(false), []);

  useOverlayBehavior({ open, onClose: close, containerRef: popupRef, modal: false });

  // Move initial focus into the calendar's roving day cell once the popover opens.
  useEffect(() => {
    if (!open) {
      return;
    }
    popupRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
  }, [open, popupRef]);

  // Close on pointer-down outside of the popover and the trigger.
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        (!triggerRef.current || !triggerRef.current.contains(event.target as Node))
      ) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, close, popupRef]);

  const handleSelect = (date: Date) => {
    if (value === undefined) {
      setInternalValue(date);
    }
    onChange?.(date);
    close();
  };

  return (
    <div {...rest} ref={ref} className={cx('ore-date-picker', className)} style={style}>
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        onClick={() => {
          if (open) {
            close();
          } else {
            setOpen(true);
          }
        }}
        className={cx('ore-date-picker__trigger', {
          'ore-date-picker__trigger--open': open,
          'ore-date-picker__trigger--placeholder': !currentDate,
        })}
      >
        <span className="ore-date-picker__icon" aria-hidden="true">
          <CalendarIcon size={16} />
        </span>
        <span className="ore-date-picker__value">{displayText}</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={popupRef}
            id={dialogId}
            role="dialog"
            aria-label={labels.pickDate}
            className="ore-date-picker__popup"
            style={anchoredStyle}
          >
            <Calendar value={currentDate} onChange={handleSelect} />
          </div>,
          document.body,
        )}
    </div>
  );
};
