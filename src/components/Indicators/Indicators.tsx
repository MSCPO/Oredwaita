import { type CSSProperties, type FC, type ReactNode } from 'react';
import cx from 'clsx';
import './Indicators.scss';

/* ShortcutLabel */
export interface ShortcutLabelProps {
  accelerator: string;
  className?: string;
}

export const ShortcutLabel: FC<ShortcutLabelProps> = ({ accelerator, className }) => {
  const keys = accelerator.split('+');

  return (
    <span className={cx('ore-shortcut-label', className)}>
      {keys.map((k, idx) => (
        <kbd key={idx} className="ore-shortcut-label__kbd">
          {k.trim()}
        </kbd>
      ))}
    </span>
  );
};

/* LevelBar */
export interface LevelBarProps {
  value: number;
  min?: number;
  max?: number;
  className?: string;
}

export const LevelBar: FC<LevelBarProps> = ({ value, min = 0, max = 100, className }) => {
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  let levelColorClass = 'ore-level-bar__fill--normal';
  if (percent <= 20) {
    levelColorClass = 'ore-level-bar__fill--low';
  } else if (percent >= 80) {
    levelColorClass = 'ore-level-bar__fill--high';
  }

  return (
    <div className={cx('ore-level-bar', className)}>
      <div className={cx('ore-level-bar__fill', levelColorClass)} style={{ width: `${percent}%` }} />
    </div>
  );
};

/* ProgressBar */
export interface ProgressBarProps {
  fraction?: number;
  pulse?: boolean;
  shimmer?: boolean;
  showText?: boolean;
  text?: string;
  className?: string;
  style?: CSSProperties;
}

export const ProgressBar: FC<ProgressBarProps> = ({
  fraction = 0,
  pulse = false,
  shimmer = false,
  showText = false,
  text,
  className,
  style,
}) => {
  const percent = Math.min(100, Math.max(0, fraction * 100));

  return (
    <div
      className={cx(
        'ore-progress-bar',
        { 'ore-progress-bar--pulse': pulse, 'ore-progress-bar--shimmer': shimmer },
        className,
      )}
      style={style}
    >
      <div className="ore-progress-bar__fill" style={{ width: pulse ? '30%' : `${percent}%` }} />
      {showText && <span className="ore-progress-bar__text">{text || `${Math.round(percent)}%`}</span>}
    </div>
  );
};

/* FadingLabel */
export interface FadingLabelProps {
  children: ReactNode;
  className?: string;
}

export const FadingLabel: FC<FadingLabelProps> = ({ children, className }) => {
  return (
    <div className={cx('ore-fading-label', className)}>
      <span className="ore-fading-label__text">{children}</span>
    </div>
  );
};

/* Badge */
export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'destructive' | 'success';
  className?: string;
}

export const Badge: FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  return <span className={cx('ore-badge', `ore-badge--${variant}`, className)}>{children}</span>;
};
