import { type FC, type HTMLAttributes, type ReactNode, useState } from 'react';
import cx from 'clsx';
import './Switch.scss';

export interface SwitchProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  activeIcon?: ReactNode;
  inactiveIcon?: ReactNode;
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export const Switch: FC<SwitchProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  activeIcon,
  inactiveIcon,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  style,
  ...rest
}) => {
  const [innerChecked, setInnerChecked] = useState(defaultChecked);
  const isChecked = controlledChecked !== undefined ? controlledChecked : innerChecked;

  const toggle = () => {
    if (disabled) {
      return;
    }
    const next = !isChecked;
    if (controlledChecked === undefined) {
      setInnerChecked(next);
    }
    onChange?.(next);
  };

  return (
    <button
      {...rest}
      type="button"
      role="switch"
      id={id}
      aria-checked={isChecked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      disabled={disabled}
      onClick={toggle}
      className={cx('ore-switch', { 'ore-switch--checked': isChecked }, className)}
      style={style}
    >
      <span className="ore-switch__slider">
        <span className="ore-switch__icon">{isChecked ? activeIcon : inactiveIcon}</span>
      </span>
    </button>
  );
};
