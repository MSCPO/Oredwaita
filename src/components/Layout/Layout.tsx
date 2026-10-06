import { type CSSProperties, type FC, type ReactNode } from 'react';
import cx from 'clsx';
import './Layout.scss';

/* Clamp */
export interface ClampProps {
  maximumSize?: 'small' | 'medium' | 'large' | number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export const Clamp: FC<ClampProps> = ({ maximumSize = 'medium', className, style, children }) => {
  let maxWidth = 'var(--ore-width-medium)';
  if (maximumSize === 'small') {
    maxWidth = 'var(--ore-width-small)';
  } else if (maximumSize === 'large') {
    maxWidth = 'var(--ore-width-large)';
  } else if (typeof maximumSize === 'number') {
    maxWidth = `${maximumSize}px`;
  }

  return (
    <div className={cx('ore-clamp', className)} style={{ maxWidth, ...style }}>
      {children}
    </div>
  );
};

/* Squeezer */
export interface SqueezerProps {
  children: ReactNode[];
  className?: string;
}

export const Squeezer: FC<SqueezerProps> = ({ children, className }) => {
  return <div className={cx('ore-squeezer', className)}>{children}</div>;
};

/* WrapBox */
export interface WrapBoxProps {
  children: ReactNode;
  homogeneous?: boolean;
  spacing?: number;
  className?: string;
  style?: CSSProperties;
}

export const WrapBox: FC<WrapBoxProps> = ({ children, homogeneous = false, spacing = 8, className, style }) => {
  return (
    <div
      className={cx('ore-wrap-box', { 'ore-wrap-box--homogeneous': homogeneous }, className)}
      style={{ gap: `${spacing}px`, ...style }}
    >
      {children}
    </div>
  );
};

/* Bin */
export interface BinProps {
  children?: ReactNode;
  className?: string;
}

export const Bin: FC<BinProps> = ({ children, className }) => {
  return <div className={cx('ore-bin', className)}>{children}</div>;
};
