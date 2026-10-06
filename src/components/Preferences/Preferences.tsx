import { type FC, type HTMLAttributes, type ReactNode, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cx from 'clsx';

import { Button } from '../Button/Button';
import { useAnimatedUnmount } from '../Dialog/Dialog';
import { useOverlayBehavior } from '../../hooks/useOverlayBehavior';
import { useOreLabels } from '../ThemeProvider/ThemeProvider';
import './Preferences.scss';

/* PreferencesGroup */
export interface PreferencesGroupProps {
  title?: ReactNode;
  description?: ReactNode;
  headerSuffix?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export const PreferencesGroup: FC<PreferencesGroupProps> = ({
  title,
  description,
  headerSuffix,
  className,
  children,
}) => {
  return (
    <div className={cx('ore-preferences-group', className)}>
      {(title || description || headerSuffix) && (
        <div className="ore-preferences-group__header">
          <div className="ore-preferences-group__titles">
            {title && <h3 className="ore-preferences-group__title">{title}</h3>}
            {description && <p className="ore-preferences-group__description">{description}</p>}
          </div>
          {headerSuffix && <div className="ore-preferences-group__suffix">{headerSuffix}</div>}
        </div>
      )}
      <div className="ore-preferences-group__list">{children}</div>
    </div>
  );
};

/* PreferencesPage */
export interface PreferencesPageProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  icon?: ReactNode;
  description?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export const PreferencesPage: FC<PreferencesPageProps> = ({
  title,
  description,
  className,
  style,
  children,
  ...rest
}) => {
  return (
    <div {...rest} className={cx('ore-preferences-page', className)} style={style}>
      {(title || description) && (
        <div className="ore-preferences-page__header">
          <h2 className="ore-preferences-page__title">{title}</h2>
          {description && <p className="ore-preferences-page__description">{description}</p>}
        </div>
      )}
      <div className="ore-preferences-page__content">{children}</div>
    </div>
  );
};

/* PreferencesWindow */
export interface PreferencesWindowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  pages: PreferencesPageProps[];
  activePageId?: string;
  onPageChange?: (id: string) => void;
  searchEnabled?: boolean;
  onClose?: () => void;
  /** Window title shown in the sidebar; falls back to the localized preferences title. */
  title?: ReactNode;
  searchPlaceholder?: string;
  closeIcon?: ReactNode;
  closeLabel?: string;
  className?: string;
}

export const PreferencesWindow: FC<PreferencesWindowProps> = ({
  pages,
  activePageId: controlledActiveId,
  onPageChange,
  searchEnabled = true,
  onClose,
  title,
  searchPlaceholder,
  closeIcon = '✕',
  closeLabel,
  className,
  style,
  ...rest
}) => {
  const labels = useOreLabels();
  const [internalActiveId, setInternalActiveId] = useState(pages[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const activeId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId;
  const activePage = pages.find((p) => p.id === activeId) || pages[0];

  const handleSelectPage = (id: string) => {
    if (controlledActiveId === undefined) {
      setInternalActiveId(id);
    }
    onPageChange?.(id);
  };

  return (
    <div {...rest} className={cx('ore-preferences-window', className)} style={style}>
      {/* Sidebar */}
      <aside className="ore-preferences-window__sidebar">
        <div className="ore-preferences-window__sidebar-header">
          <span className="ore-preferences-window__sidebar-title">{title ?? labels.preferences}</span>
        </div>

        {searchEnabled && (
          <div className="ore-preferences-window__search">
            <input
              type="text"
              placeholder={searchPlaceholder ?? labels.searchPreferences}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ore-preferences-window__search-input"
            />
          </div>
        )}

        <nav className="ore-preferences-window__nav">
          {pages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPage(p.id)}
              className={cx('ore-preferences-window__nav-item', {
                'ore-preferences-window__nav-item--active': p.id === activeId,
              })}
            >
              {p.icon && <span className="ore-preferences-window__nav-icon">{p.icon}</span>}
              <span className="ore-preferences-window__nav-label">{p.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ore-preferences-window__main">
        {onClose && (
          <div className="ore-preferences-window__main-header">
            <Button variant="flat" shape="circular" onClick={onClose} aria-label={closeLabel ?? labels.close}>
              {closeIcon}
            </Button>
          </div>
        )}
        {activePage && <PreferencesPage {...activePage} />}
      </main>
    </div>
  );
};

/* PreferencesDialog */
export interface PreferencesDialogProps extends PreferencesWindowProps {
  open: boolean;
}

export const PreferencesDialog: FC<PreferencesDialogProps> = ({ open, onClose, ...props }) => {
  const { mounted, closing } = useAnimatedUnmount(open, 200);
  const dialogRef = useRef<HTMLDivElement>(null);
  useOverlayBehavior({ open, onClose, containerRef: dialogRef });

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      role="presentation"
      className={cx('ore-preferences-dialog-overlay', {
        'ore-preferences-dialog-overlay--closing': closing,
      })}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={cx('ore-preferences-dialog-content', {
          'ore-preferences-dialog-content--closing': closing,
        })}
      >
        <PreferencesWindow {...props} onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
};
