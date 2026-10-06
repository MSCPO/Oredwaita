import { type FC, type HTMLAttributes, type ReactNode, useEffect, useRef } from 'react';
import cx from 'clsx';

import './Toast.scss';

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  id?: string;
  title: ReactNode;
  /** Custom action area rendered at the tail of the toast; compose any number of Buttons here. */
  actions?: ReactNode;
  /** Optional leading icon rendered before the title. */
  icon?: ReactNode;
  timeout?: number;
  onDismiss?: () => void;
}

export const Toast: FC<ToastProps> = ({
  title,
  actions,
  icon,
  timeout = 4000,
  onDismiss,
  className,
  style,
  ...rest
}) => {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);
  useEffect(() => {
    if (timeout <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      onDismissRef.current?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  return (
    <div {...rest} className={cx('ore-toast', className)} style={style} role="status">
      {icon && <span className="ore-toast__icon">{icon}</span>}
      <span className="ore-toast__title">{title}</span>
      {actions}
    </div>
  );
};

export interface ToastOverlayProps {
  children?: ReactNode;
  toasts?: ToastProps[];
  onDismissToast?: (id: string) => void;
  className?: string;
}

export const ToastOverlay: FC<ToastOverlayProps> = ({ children, toasts = [], onDismissToast, className }) => {
  return (
    <div className={cx('ore-toast-overlay', className)}>
      <div className="ore-toast-overlay__content">{children}</div>
      <div className="ore-toast-overlay__container">
        {toasts.map((t, idx) => {
          const toastId = t.id ?? `toast-${idx}`;

          return <Toast key={toastId} {...t} onDismiss={() => onDismissToast?.(toastId)} />;
        })}
      </div>
    </div>
  );
};
