import {
  Children,
  type FC,
  type HTMLAttributes,
  isValidElement,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import cx from 'clsx';

import { useOverlayBehavior } from '../../hooks/useOverlayBehavior';
import { Button } from '../Button/Button';
import { useOreLabels } from '../ThemeProvider/ThemeProvider';
import './Tabs.scss';

export interface TabItem {
  id: string;
  title: string;
  icon?: ReactNode;
  pinned?: boolean;
  closable?: boolean;
}

export interface TabBarProps extends HTMLAttributes<HTMLDivElement> {
  tabs: TabItem[];
  /** Controlled active tab id. When omitted, the tab bar manages its own active state. */
  activeTabId?: string;
  /** Initial active tab id for uncontrolled usage; falls back to the first tab. */
  defaultActiveTabId?: string;
  onTabChange?: (id: string) => void;
  onTabClose?: (id: string) => void;
  onNewTab?: () => void;
  /** Icon rendered inside the per-tab close button. */
  closeIcon?: ReactNode;
  /** Icon rendered inside the "new tab" button. */
  newTabIcon?: ReactNode;
  /** Accessible label for the "new tab" button; falls back to the localized new-tab label. */
  newTabLabel?: string;
  /**
   * Accessible label for the per-tab close buttons. When omitted, the localized
   * close-tab label is combined with the tab title.
   */
  closeTabLabel?: string;
}

export const TabBar: FC<TabBarProps> = ({
  tabs,
  activeTabId: controlledActiveTabId,
  defaultActiveTabId,
  onTabChange,
  onTabClose,
  onNewTab,
  closeIcon = '✕',
  newTabIcon = '+',
  newTabLabel,
  closeTabLabel,
  className,
  style,
  ...rest
}) => {
  const labels = useOreLabels();
  const [innerActiveTabId, setInnerActiveTabId] = useState(defaultActiveTabId ?? tabs[0]?.id);
  const activeTabId = controlledActiveTabId !== undefined ? controlledActiveTabId : innerActiveTabId;

  const handleTabChange = (id: string) => {
    if (controlledActiveTabId === undefined) {
      setInnerActiveTabId(id);
    }
    onTabChange?.(id);
  };

  const handleTablistKeydown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (tabs.length === 0) {
      return;
    }
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId);
    let nextIndex = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
    }
    if (nextIndex >= 0) {
      event.preventDefault();
      handleTabChange(tabs[nextIndex].id);
      const tabElements = event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]');
      tabElements[nextIndex]?.focus();
    }
  };

  return (
    <div {...rest} className={cx('ore-tab-bar', className)} style={style}>
      <div className="ore-tab-bar__scroll" role="tablist" tabIndex={-1} onKeyDown={handleTablistKeydown}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              id={`ore-tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`ore-tab-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabChange(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTabChange(tab.id);
                }
              }}
              className={cx('ore-tab-bar__tab', {
                'ore-tab-bar__tab--active': isActive,
                'ore-tab-bar__tab--pinned': tab.pinned,
              })}
            >
              {tab.icon && <span className="ore-tab-bar__tab-icon">{tab.icon}</span>}
              {!tab.pinned && <span className="ore-tab-bar__tab-title">{tab.title}</span>}
              {tab.closable !== false && onTabClose && !tab.pinned && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                  className="ore-tab-bar__close-btn"
                  aria-label={closeTabLabel ?? labels.closeTab(tab.title)}
                >
                  {closeIcon}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {onNewTab && (
        <Button
          variant="flat"
          shape="circular"
          onClick={onNewTab}
          className="ore-tab-bar__new-tab-btn"
          aria-label={newTabLabel ?? labels.newTab}
        >
          {newTabIcon}
        </Button>
      )}
    </div>
  );
};

export interface TabViewProps extends HTMLAttributes<HTMLDivElement> {
  activeTabId: string;
  children: ReactNode;
}

export const TabView: FC<TabViewProps> = ({ activeTabId, children, className, style, ...rest }) => {
  return (
    <div {...rest} className={cx('ore-tab-view', className)} style={style}>
      {Children.map(children, (child) => {
        if (!isValidElement<{ id?: string }>(child)) {
          return null;
        }
        if (child.props.id === activeTabId) {
          return (
            <div
              key={child.props.id}
              id={`ore-tab-panel-${child.props.id}`}
              role="tabpanel"
              aria-labelledby={`ore-tab-${child.props.id}`}
              className="ore-tab-view__panel"
            >
              {child}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export interface TabOverviewProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab?: (id: string) => void;
  onClose: () => void;
  /** Heading shown in the overview header and used as the dialog accessible name; falls back to the localized title. */
  title?: ReactNode;
  /** Icon rendered inside the header close button. */
  closeIcon?: ReactNode;
  /** Accessible label for the header close button; falls back to the localized close-overview label. */
  closeLabel?: string;
  /** Builds the accessible label for a thumbnail close button from the tab title; falls back to the localized label. */
  closeTabLabel?: (tabTitle: string) => string;
}

export const TabOverview: FC<TabOverviewProps> = ({
  open,
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onClose,
  title,
  closeIcon = '✕',
  closeLabel,
  closeTabLabel,
  className,
  style,
  ...rest
}) => {
  const labels = useOreLabels();
  const resolvedTitle = title ?? labels.tabsOverview;
  const overviewRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlayBehavior({ open, onClose, containerRef: overviewRef });

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      {...rest}
      ref={overviewRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={resolvedTitle ? titleId : undefined}
      className={cx('ore-tab-overview-overlay', className)}
      style={style}
    >
      <div className="ore-tab-overview__header">
        <span id={titleId} className="ore-tab-overview__title">
          {resolvedTitle}
        </span>
        <Button variant="flat" shape="circular" onClick={onClose} aria-label={closeLabel ?? labels.closeOverview}>
          {closeIcon}
        </Button>
      </div>
      <div className="ore-tab-overview__grid">
        {tabs.map((t) => (
          <div
            key={t.id}
            role="button"
            tabIndex={0}
            onClick={() => {
              onSelectTab(t.id);
              onClose();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectTab(t.id);
                onClose();
              }
            }}
            className={cx('ore-tab-thumbnail', {
              'ore-tab-thumbnail--active': t.id === activeTabId,
            })}
          >
            <div className="ore-tab-thumbnail__card">
              <span className="ore-tab-thumbnail__title">{t.title}</span>
              {onCloseTab && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(t.id);
                  }}
                  className="ore-tab-thumbnail__close"
                  aria-label={(closeTabLabel ?? labels.closeTab)(t.title)}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
};
