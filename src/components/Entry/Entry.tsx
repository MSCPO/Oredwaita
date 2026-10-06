import { type ChangeEvent, type FC, type InputHTMLAttributes, type Ref, useState } from 'react';
import cx from 'clsx';

import './Entry.scss';

export interface EntryProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  /** Controlled entry text, mirroring the text of a GTK `GtkEntry` widget. */
  value?: string;
  /** Initial text for uncontrolled usage. */
  defaultValue?: string;
  /** Called with the new text (a plain string) on every change. */
  onChange?: (value: string) => void;
  /** Ref attached to the underlying input element. */
  ref?: Ref<HTMLInputElement>;
}

/**
 * Single-line text entry following the GNOME HIG text fields guidance and the
 * GTK `GtkEntry` widget semantics.
 */
export const Entry: FC<EntryProps> = ({
  value,
  defaultValue,
  onChange,
  disabled = false,
  ref,
  className,
  style,
  ...rest
}) => {
  const [innerValue, setInnerValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : innerValue;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (!isControlled) {
      setInnerValue(next);
    }
    onChange?.(next);
  };

  return (
    <input
      {...rest}
      ref={ref}
      type="text"
      value={currentValue}
      onChange={handleChange}
      disabled={disabled}
      className={cx('ore-entry', { 'ore-entry--disabled': disabled }, className)}
      style={style}
    />
  );
};
