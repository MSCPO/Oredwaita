import { type ButtonHTMLAttributes, type FC, type ReactNode } from 'react';
import cx from 'clsx';
import './Button.scss';

export type ButtonVariant = 'default' | 'suggested' | 'destructive' | 'flat';
export type ButtonShape = 'default' | 'pill' | 'circular';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  shape?: ButtonShape;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
}

export const Button: FC<ButtonProps> = ({
  variant = 'default',
  shape = 'default',
  size = 'md',
  icon,
  loading = false,
  disabled,
  className,
  children,
  ...rest
}) => {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cx(
        'ore-button',
        `ore-button--${variant}`,
        shape !== 'default' && `ore-button--${shape}`,
        size !== 'md' && `ore-button--${size}`,
        {
          'ore-button--loading': loading,
          'ore-button--icon-only': icon && !children,
        },
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="ore-button__spinner" aria-hidden="true" />
      ) : (
        icon && <span className="ore-button__icon">{icon}</span>
      )}
      {children && <span className="ore-button__label">{children}</span>}
    </button>
  );
};

export interface ButtonContentProps {
  icon?: ReactNode;
  label: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export const ButtonContent: FC<ButtonContentProps> = ({ icon, label, badge, className }) => {
  return (
    <span className={cx('ore-button-content', className)}>
      {icon && <span className="ore-button-content__icon">{icon}</span>}
      <span className="ore-button-content__label">{label}</span>
      {badge && <span className="ore-button-content__badge">{badge}</span>}
    </span>
  );
};
