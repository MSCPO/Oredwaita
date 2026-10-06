import { type ChangeEvent, type FC, type HTMLAttributes, type ReactNode, useState } from 'react';
import cx from 'clsx';

import { useOreLabels } from '../ThemeProvider/ThemeProvider';
import './Controls.scss';

/* CheckButton */
export interface CheckButtonProps extends Omit<HTMLAttributes<HTMLLabelElement>, 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const CheckButton: FC<CheckButtonProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  label,
  disabled = false,
  className,
  id,
  style,
  ...rest
}) => {
  const [innerChecked, setInnerChecked] = useState(defaultChecked);
  const isChecked = controlledChecked !== undefined ? controlledChecked : innerChecked;

  const handleChange = (next: boolean) => {
    if (controlledChecked === undefined) {
      setInnerChecked(next);
    }
    onChange?.(next);
  };

  return (
    <label
      {...rest}
      className={cx('ore-check-button', { 'ore-check-button--disabled': disabled }, className)}
      style={style}
    >
      <input
        type="checkbox"
        id={id}
        checked={isChecked}
        disabled={disabled}
        onChange={(e) => handleChange(e.target.checked)}
        className="ore-check-button__input"
      />
      <span className="ore-check-button__box">
        {isChecked && <span className="ore-check-button__checkmark">✓</span>}
      </span>
      {label && <span className="ore-check-button__label">{label}</span>}
    </label>
  );
};

/* RadioButton */
export interface RadioButtonProps extends Omit<HTMLAttributes<HTMLLabelElement>, 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: () => void;
  label?: ReactNode;
  disabled?: boolean;
  name?: string;
  className?: string;
  id?: string;
}

export const RadioButton: FC<RadioButtonProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  label,
  disabled = false,
  name,
  className,
  id,
  style,
  ...rest
}) => {
  const [innerChecked, setInnerChecked] = useState(defaultChecked);
  const isChecked = controlledChecked !== undefined ? controlledChecked : innerChecked;

  const handleChange = () => {
    if (controlledChecked === undefined) {
      setInnerChecked(true);
    }
    onChange?.();
  };

  return (
    <label
      {...rest}
      className={cx('ore-radio-button', { 'ore-radio-button--disabled': disabled }, className)}
      style={style}
    >
      <input
        type="radio"
        id={id}
        name={name}
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        className="ore-radio-button__input"
      />
      <span className="ore-radio-button__circle">{isChecked && <span className="ore-radio-button__dot" />}</span>
      {label && <span className="ore-radio-button__label">{label}</span>}
    </label>
  );
};

/* Scale (Range Slider) */
export interface ScaleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  showValue?: boolean;
  className?: string;
}

export const Scale: FC<ScaleProps> = ({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  showValue = false,
  className,
  style,
  ...rest
}) => {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : innerValue;
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const handleChange = (next: number) => {
    if (controlledValue === undefined) {
      setInnerValue(next);
    }
    onChange?.(next);
  };

  return (
    <div {...rest} className={cx('ore-scale', { 'ore-scale--disabled': disabled }, className)} style={style}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(Number(e.target.value))}
        className="ore-scale__range"
        style={{ backgroundSize: `${percent}% 100%` }}
      />
      {showValue && <span className="ore-scale__value">{value}</span>}
    </div>
  );
};

/* SpinButton */
export interface SpinButtonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  /** Accessible label of the decrement button; falls back to the localized decrease label. */
  decreaseLabel?: string;
  /** Accessible label of the increment button; falls back to the localized increase label. */
  increaseLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const SpinButton: FC<SpinButtonProps> = ({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  decreaseLabel,
  increaseLabel,
  disabled = false,
  className,
  style,
  ...rest
}) => {
  const labels = useOreLabels();
  const [innerValue, setInnerValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : innerValue;

  const handleChange = (next: number) => {
    if (controlledValue === undefined) {
      setInnerValue(next);
    }
    onChange?.(next);
  };

  const handleDecrement = () => {
    if (disabled) {
      return;
    }
    handleChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    if (disabled) {
      return;
    }
    handleChange(Math.min(max, value + step));
  };

  return (
    <div
      {...rest}
      className={cx('ore-spin-button', { 'ore-spin-button--disabled': disabled }, className)}
      style={style}
    >
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={handleDecrement}
        className="ore-spin-button__btn"
        aria-label={decreaseLabel ?? labels.decrease}
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => {
          const num = Number(e.target.value);
          if (!isNaN(num)) {
            handleChange(Math.min(max, Math.max(min, num)));
          }
        }}
        className="ore-spin-button__input"
      />
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={handleIncrement}
        className="ore-spin-button__btn"
        aria-label={increaseLabel ?? labels.increase}
      >
        +
      </button>
    </div>
  );
};
