import { type ChangeEvent, type FC, type Ref, type TextareaHTMLAttributes, useState } from 'react';
import cx from 'clsx';

import './Entry.scss';

export interface TextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange' | 'value' | 'defaultValue'
> {
  /** Controlled entry text, mirroring the buffer of a GTK `GtkTextView` widget. */
  value?: string;
  /** Initial text for uncontrolled usage. */
  defaultValue?: string;
  /** Called with the new text (a plain string) on every change. */
  onChange?: (value: string) => void;
  /** Ref attached to the underlying textarea element. */
  ref?: Ref<HTMLTextAreaElement>;
}

/**
 * Multi-line text entry following the GNOME HIG text fields guidance and the
 * GTK `GtkTextView` widget semantics.
 */
export const TextArea: FC<TextAreaProps> = ({
  value,
  defaultValue,
  onChange,
  disabled = false,
  rows = 4,
  ref,
  className,
  style,
  ...rest
}) => {
  const [innerValue, setInnerValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : innerValue;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    if (!isControlled) {
      setInnerValue(next);
    }
    onChange?.(next);
  };

  return (
    <textarea
      {...rest}
      ref={ref}
      value={currentValue}
      onChange={handleChange}
      disabled={disabled}
      rows={rows}
      className={cx('ore-text-area', { 'ore-text-area--disabled': disabled }, className)}
      style={style}
    />
  );
};
