import { Children, type FC, isValidElement, type ReactNode } from 'react';
import cx from 'clsx';

import { SidebarItem, SidebarSection } from '../Sidebar/Sidebar';
import './ViewSwitcher.scss';

export interface ViewPageItem {
  id: string;
  title: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

export interface ViewSwitcherProps {
  pages: ViewPageItem[];
  activePage: string;
  onPageChange: (id: string) => void;
  policy?: 'auto' | 'narrow' | 'wide';
  className?: string;
}

export const ViewSwitcher: FC<ViewSwitcherProps> = ({
  pages,
  activePage,
  onPageChange,
  policy = 'auto',
  className,
}) => {
  return (
    <nav className={cx('ore-view-switcher', `ore-view-switcher--${policy}`, className)}>
      {pages.map((p) => {
        const active = p.id === activePage;

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onPageChange(p.id)}
            className={cx('ore-view-switcher__btn', {
              'ore-view-switcher__btn--active': active,
            })}
          >
            {p.icon && <span className="ore-view-switcher__icon">{p.icon}</span>}
            <span className="ore-view-switcher__title">{p.title}</span>
            {p.badge && <span className="ore-view-switcher__badge">{p.badge}</span>}
          </button>
        );
      })}
    </nav>
  );
};

export const InlineViewSwitcher: FC<ViewSwitcherProps> = (props) => {
  return <ViewSwitcher {...props} className={cx('ore-view-switcher--inline', props.className)} />;
};

export interface ViewSwitcherBarProps extends ViewSwitcherProps {
  reveal?: boolean;
}

export const ViewSwitcherBar: FC<ViewSwitcherBarProps> = ({ reveal = true, ...props }) => {
  if (!reveal) {
    return null;
  }

  return (
    <div className="ore-view-switcher-bar">
      <ViewSwitcher {...props} policy="wide" />
    </div>
  );
};

export interface ViewSwitcherSidebarProps {
  pages: ViewPageItem[];
  activePage: string;
  onPageChange: (id: string) => void;
  title?: ReactNode;
  className?: string;
}

export const ViewSwitcherSidebar: FC<ViewSwitcherSidebarProps> = ({
  pages,
  activePage,
  onPageChange,
  title,
  className,
}) => {
  return (
    <SidebarSection title={title} className={className}>
      {pages.map((p) => (
        <SidebarItem
          key={p.id}
          id={p.id}
          title={p.title}
          icon={p.icon}
          badge={p.badge}
          selected={p.id === activePage}
          onSelect={() => onPageChange(p.id)}
        />
      ))}
    </SidebarSection>
  );
};

export interface ViewStackProps {
  activePage: string;
  children: ReactNode;
  className?: string;
}

export const ViewStack: FC<ViewStackProps> = ({ activePage, children, className }) => {
  return (
    <div className={cx('ore-view-stack', className)}>
      {Children.map(children, (child) => {
        if (!isValidElement<{ id?: string }>(child)) {
          return null;
        }
        if (child.props.id === activePage) {
          return child;
        }

        return null;
      })}
    </div>
  );
};
