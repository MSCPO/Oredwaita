import { type FC, type MouseEvent, type ReactNode } from 'react';
import cx from 'clsx';

import { Button, type ButtonVariant } from '../Button/Button';
import { useOreLabels } from '../ThemeProvider/ThemeProvider';
import './SplitButton.scss';

export interface SplitButtonProps {
  label?: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick?: () => void;
  onDropdownClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  dropdownOpen?: boolean;
  /** Accessible label of the dropdown button; falls back to the localized more-options label. */
  dropdownLabel?: string;
  className?: string;
  dropdownIcon?: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export const SplitButton: FC<SplitButtonProps> = ({
  label,
  icon,
  variant = 'default',
  disabled = false,
  onClick,
  onDropdownClick,
  dropdownOpen,
  dropdownLabel,
  className,
  dropdownIcon = '▾',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const labels = useOreLabels();

  return (
    <div className={cx('ore-split-button', `ore-split-button--${variant}`, className)}>
      <Button
        variant={variant}
        disabled={disabled}
        onClick={onClick}
        icon={icon}
        className="ore-split-button__main"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {label}
      </Button>
      <Button
        variant={variant}
        disabled={disabled}
        onClick={onDropdownClick}
        className="ore-split-button__dropdown"
        aria-label={dropdownLabel ?? labels.moreOptions}
        aria-haspopup="menu"
        aria-expanded={dropdownOpen}
      >
        {dropdownIcon}
      </Button>
    </div>
  );
};
