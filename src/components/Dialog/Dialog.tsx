/* eslint-disable react-refresh/only-export-components */
import { type FC, type HTMLAttributes, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cx from 'clsx';

import { useOverlayBehavior } from '../../hooks/useOverlayBehavior';
import { Button } from '../Button/Button';
import { Avatar } from '../Avatar/Avatar';
import { useOreLabels } from '../ThemeProvider/ThemeProvider';
import './Dialog.scss';

export const useAnimatedUnmount = (open: boolean, duration: number = 200) => {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  if (open && !mounted) {
    setMounted(true);
  }
  if (open && closing) {
    setClosing(false);
  }
  if (!open && mounted && !closing) {
    setClosing(true);
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!open && mounted) {
      timer = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, duration);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [open, duration, mounted]);

  return { mounted, closing };
};

export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Custom content for the header close button. Defaults to '✕'. */
  closeIcon?: ReactNode;
  /** Accessible name of the header close button; falls back to the localized close label. */
  closeLabel?: string;
}

export const Dialog: FC<DialogProps> = ({
  open,
  onClose,
  title,
  children,
  closeIcon = '✕',
  closeLabel,
  className,
  style,
  ...rest
}) => {
  const labels = useOreLabels();
  const { mounted, closing } = useAnimatedUnmount(open, 200);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlayBehavior({ open, onClose, containerRef: dialogRef });

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      role="presentation"
      className={cx('ore-dialog-overlay', { 'ore-dialog-overlay--closing': closing })}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        {...rest}
        className={cx('ore-dialog', { 'ore-dialog--closing': closing }, className)}
        style={style}
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {title && (
          <div className="ore-dialog__header">
            <span id={titleId} className="ore-dialog__title">
              {title}
            </span>
            <Button variant="flat" shape="circular" onClick={onClose} aria-label={closeLabel ?? labels.close}>
              {closeIcon}
            </Button>
          </div>
        )}
        <div className="ore-dialog__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export interface MessageDialogResponse {
  id: string;
  label: ReactNode;
  appearance?: 'default' | 'suggested' | 'destructive';
}

export interface MessageDialogProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  heading: ReactNode;
  body?: ReactNode;
  responses: MessageDialogResponse[];
  onResponse: (responseId: string) => void;
}

export const MessageDialog: FC<MessageDialogProps> = ({
  open,
  onClose,
  heading,
  body,
  responses,
  onResponse,
  className,
  style,
  ...rest
}) => {
  const { mounted, closing } = useAnimatedUnmount(open, 200);
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  useOverlayBehavior({ open, onClose, containerRef: dialogRef });

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      role="presentation"
      className={cx('ore-dialog-overlay', { 'ore-dialog-overlay--closing': closing })}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        {...rest}
        className={cx('ore-dialog', 'ore-message-dialog', { 'ore-dialog--closing': closing }, className)}
        style={style}
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <div className="ore-message-dialog__content">
          <h3 id={headingId} className="ore-message-dialog__heading">
            {heading}
          </h3>
          {body && <div className="ore-message-dialog__body">{body}</div>}
        </div>
        <div className="ore-message-dialog__actions">
          {responses.map((resp) => (
            <Button
              key={resp.id}
              variant={
                resp.appearance === 'suggested'
                  ? 'suggested'
                  : resp.appearance === 'destructive'
                    ? 'destructive'
                    : 'flat'
              }
              onClick={() => {
                onResponse(resp.id);
                onClose();
              }}
              className="ore-message-dialog__action-btn"
            >
              {resp.label}
            </Button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export type AlertDialogProps = MessageDialogProps;
export const AlertDialog: FC<AlertDialogProps> = (props) => <MessageDialog {...props} />;

export interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
  applicationName: string;
  version?: string;
  developerName?: string;
  /** Custom developer line; replaces the default "Developed by {developerName}" line entirely. */
  developerLine?: ReactNode;
  comments?: string;
  copyright?: string;
  website?: string;
  /** Custom label for the website link; falls back to the localized website label. */
  websiteLabel?: ReactNode;
  logo?: ReactNode;
  className?: string;
}

export const AboutDialog: FC<AboutDialogProps> = ({
  open,
  onClose,
  applicationName,
  version,
  developerName,
  developerLine,
  comments,
  copyright,
  website,
  websiteLabel,
  logo,
  className,
}) => {
  const labels = useOreLabels();

  return (
    <Dialog open={open} onClose={onClose} className={cx('ore-about-dialog', className)}>
      <div className="ore-about-dialog__header">
        {logo ? logo : <Avatar text={applicationName} size={80} />}
        <h2 className="ore-about-dialog__name">{applicationName}</h2>
        {version && <span className="ore-about-dialog__version">v{version}</span>}
      </div>
      <div className="ore-about-dialog__details">
        {comments && <p className="ore-about-dialog__comments">{comments}</p>}
        {developerLine ??
          (developerName && <p className="ore-about-dialog__dev">{labels.developedBy(developerName)}</p>)}
        {copyright && <p className="ore-about-dialog__copyright">{copyright}</p>}
        {website && (
          <a href={website} target="_blank" rel="noreferrer" className="ore-about-dialog__link">
            {websiteLabel ?? labels.website}
          </a>
        )}
      </div>
    </Dialog>
  );
};

export interface ShortcutItem {
  title: string;
  accelerator: string;
}

export interface ShortcutSection {
  title: string;
  shortcuts: ShortcutItem[];
}

export interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
  sections: ShortcutSection[];
  /** Custom dialog title; falls back to the localized keyboard shortcuts title. */
  title?: ReactNode;
  className?: string;
  closeIcon?: ReactNode;
  closeLabel?: string;
}

export const ShortcutsDialog: FC<ShortcutsDialogProps> = ({
  open,
  onClose,
  sections,
  title,
  className,
  closeIcon,
  closeLabel,
}) => {
  const labels = useOreLabels();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title ?? labels.keyboardShortcuts}
      className={cx('ore-shortcuts-dialog', className)}
      closeIcon={closeIcon}
      closeLabel={closeLabel}
    >
      <div className="ore-shortcuts-dialog__grid">
        {sections.map((sec, idx) => (
          <div key={idx} className="ore-shortcuts-dialog__section">
            <h4 className="ore-shortcuts-dialog__sec-title">{sec.title}</h4>
            <div className="ore-shortcuts-dialog__list">
              {sec.shortcuts.map((sc, i) => (
                <div key={i} className="ore-shortcuts-dialog__item">
                  <span className="ore-shortcuts-dialog__item-title">{sc.title}</span>
                  <kbd className="ore-shortcuts-dialog__kbd">{sc.accelerator}</kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  );
};
