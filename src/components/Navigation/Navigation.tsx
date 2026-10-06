import { type FC, type ReactNode, useRef, useState } from 'react';
import cx from 'clsx';

import { useOverlayBehavior } from '../../hooks/useOverlayBehavior';
import './Navigation.scss';

/* NavigationView (Stack Navigation) */
export interface NavPage {
  id: string;
  title: string;
  content:
    | ReactNode
    | ((helpers: { pushPage: (id: string) => void; popPage: () => void; canPop: boolean }) => ReactNode);
}

export interface NavigationViewProps {
  initialPageId: string;
  pages: NavPage[];
  className?: string;
}

export const NavigationView: FC<NavigationViewProps> = ({ initialPageId, pages, className }) => {
  const [stack, setStack] = useState<string[]>([initialPageId]);

  const activeId = stack[stack.length - 1];
  const activePage = pages.find((p) => p.id === activeId) || pages[0];

  const pushPage = (id: string) => {
    setStack((prev) => [...prev, id]);
  };

  const popPage = () => {
    if (stack.length > 1) {
      setStack((prev) => prev.slice(0, prev.length - 1));
    }
  };

  return (
    <div className={cx('ore-navigation-view', className)}>
      {activePage && (
        <div className="ore-navigation-page">
          {typeof activePage.content === 'function'
            ? (
                activePage.content as (helpers: {
                  pushPage: (id: string) => void;
                  popPage: () => void;
                  canPop: boolean;
                }) => ReactNode
              )({ pushPage, popPage, canPop: stack.length > 1 })
            : activePage.content}
        </div>
      )}
    </div>
  );
};

/* NavigationSplitView */
export interface NavigationSplitViewProps {
  sidebar: ReactNode;
  content: ReactNode;
  collapsed?: boolean;
  showContent?: boolean;
  className?: string;
}

export const NavigationSplitView: FC<NavigationSplitViewProps> = ({
  sidebar,
  content,
  collapsed = false,
  showContent = true,
  className,
}) => {
  return (
    <div
      className={cx(
        'ore-navigation-split-view',
        {
          'ore-navigation-split-view--collapsed': collapsed,
          'ore-navigation-split-view--show-content': showContent,
        },
        className,
      )}
    >
      <aside className="ore-navigation-split-view__sidebar">{sidebar}</aside>
      <main className="ore-navigation-split-view__content">{content}</main>
    </div>
  );
};

/* OverlaySplitView */
export interface OverlaySplitViewProps {
  sidebar: ReactNode;
  content: ReactNode;
  sidebarVisible?: boolean;
  onSidebarVisibleChange?: (visible: boolean) => void;
  className?: string;
}

export const OverlaySplitView: FC<OverlaySplitViewProps> = ({
  sidebar,
  content,
  sidebarVisible = false,
  onSidebarVisibleChange,
  className,
}) => {
  const sidebarRef = useRef<HTMLElement>(null);

  useOverlayBehavior({
    open: sidebarVisible,
    onClose: () => onSidebarVisibleChange?.(false),
    containerRef: sidebarRef,
    modal: false,
  });

  return (
    <div className={cx('ore-overlay-split-view', className)}>
      <main className="ore-overlay-split-view__content">{content}</main>
      {sidebarVisible && (
        <>
          <div
            className="ore-overlay-split-view__backdrop"
            aria-hidden="true"
            onClick={() => onSidebarVisibleChange?.(false)}
          />
          <aside ref={sidebarRef} className="ore-overlay-split-view__sidebar">
            {sidebar}
          </aside>
        </>
      )}
    </div>
  );
};

/* Flap */
export interface FlapProps {
  flap: ReactNode;
  content: ReactNode;
  position?: 'start' | 'end';
  folded?: boolean;
  className?: string;
}

export const Flap: FC<FlapProps> = ({ flap, content, position = 'start', folded = false, className }) => {
  return (
    <div className={cx('ore-flap', `ore-flap--${position}`, { 'ore-flap--folded': folded }, className)}>
      <div className="ore-flap__pane">{flap}</div>
      <div className="ore-flap__content">{content}</div>
    </div>
  );
};
