import { type FC, type MouseEvent, type ReactNode } from 'react';
import cx from 'clsx';
import './Sidebar.scss';

export interface SidebarItemProps {
  id?: string;
  title: ReactNode;
  icon?: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  badge?: ReactNode;
  suffix?: ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const SidebarItem: FC<SidebarItemProps> = ({
  title,
  icon,
  selected = false,
  onSelect,
  badge,
  suffix,
  disabled = false,
  className,
  onClick,
}) => {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    onSelect?.();
    onClick?.(e);
  };

  return (
    <button
      type="button"
      className={cx(
        'ore-sidebar-item',
        {
          'ore-sidebar-item--selected': selected,
        },
        className,
      )}
      onClick={handleClick}
      disabled={disabled}
    >
      {icon && <span className="ore-sidebar-item__icon">{icon}</span>}
      <span className="ore-sidebar-item__title">{title}</span>
      {badge !== undefined && badge !== null && <span className="ore-sidebar-item__badge">{badge}</span>}
      {suffix && <span className="ore-sidebar-item__suffix">{suffix}</span>}
    </button>
  );
};

export interface SidebarSectionProps {
  title?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const SidebarSection: FC<SidebarSectionProps> = ({ title, action, children, className }) => {
  return (
    <div className={cx('ore-sidebar-section', className)}>
      {(title || action) && (
        <div className="ore-sidebar-section__header">
          {title && <span className="ore-sidebar-section__title">{title}</span>}
          {action && <div className="ore-sidebar-section__action">{action}</div>}
        </div>
      )}
      <div className="ore-sidebar-section__items">{children}</div>
    </div>
  );
};

export interface SidebarProps {
  header?: ReactNode;
  footer?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  collapsed?: boolean;
  className?: string;
}

export const Sidebar: FC<SidebarProps> = ({ header, footer, title, children, collapsed = false, className }) => {
  return (
    <aside
      className={cx(
        'ore-sidebar',
        {
          'ore-sidebar--collapsed': collapsed,
        },
        className,
      )}
    >
      {(header || title) && (
        <div className="ore-sidebar__header">
          {title && <div className="ore-sidebar__title">{title}</div>}
          {header}
        </div>
      )}
      <div className="ore-sidebar__body">{children}</div>
      {footer && <div className="ore-sidebar__footer">{footer}</div>}
    </aside>
  );
};
