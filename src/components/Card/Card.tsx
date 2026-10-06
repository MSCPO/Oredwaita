import { type FC, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import cx from 'clsx';

import './Card.scss';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Ref forwarded to the root card element. */
  ref?: Ref<HTMLDivElement>;
  /**
   * Adds a hover/active pressed look and a pointer cursor, for cards that act
   * as a single clickable row (purely visual; wire onClick yourself).
   */
  interactive?: boolean;
}

/**
 * Card — a rounded surface used to group related content or preference rows,
 * following the GNOME HIG card pattern (grouped boxes inside windows and
 * preference pages).
 *
 * Use it as a plain container (pass children directly) or compose it with
 * CardHeader, CardBody and CardFooter.
 */
export const Card: FC<CardProps> = ({ ref, interactive = false, className, style, ...rest }) => (
  <div
    {...rest}
    ref={ref}
    className={cx('ore-card', { 'ore-card--interactive': interactive }, className)}
    style={style}
  />
);

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Ref forwarded to the header element. */
  ref?: Ref<HTMLDivElement>;
  /** Main heading of the card. */
  title?: ReactNode;
  /** Secondary line rendered under the title. */
  subtitle?: ReactNode;
  /** Optional leading icon rendered before the title/subtitle column. */
  icon?: ReactNode;
  /** Trailing action area rendered at the end of the header row. */
  actions?: ReactNode;
}

/** Header row of a card: optional icon, a title/subtitle column, and trailing actions. */
export const CardHeader: FC<CardHeaderProps> = ({ ref, title, subtitle, icon, actions, className, style, ...rest }) => {
  const hasTitle = title !== undefined && title !== null && title !== '';
  const hasSubtitle = subtitle !== undefined && subtitle !== null && subtitle !== '';

  return (
    <div {...rest} ref={ref} className={cx('ore-card__header', className)} style={style}>
      {icon && (
        <span className="ore-card__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {(hasTitle || hasSubtitle) && (
        <div className="ore-card__heading">
          {hasTitle && <div className="ore-card__title">{title}</div>}
          {hasSubtitle && <div className="ore-card__subtitle">{subtitle}</div>}
        </div>
      )}
      {actions && <div className="ore-card__actions">{actions}</div>}
    </div>
  );
};

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Ref forwarded to the body element. */
  ref?: Ref<HTMLDivElement>;
}

/** Content area of a card; a padded container for arbitrary children. */
export const CardBody: FC<CardBodyProps> = ({ ref, children, className, style, ...rest }) => (
  <div {...rest} ref={ref} className={cx('ore-card__body', className)} style={style}>
    {children}
  </div>
);

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Ref forwarded to the footer element. */
  ref?: Ref<HTMLDivElement>;
}

/** Footer of a card, separated from the content above by a hairline. */
export const CardFooter: FC<CardFooterProps> = ({ ref, children, className, style, ...rest }) => (
  <div {...rest} ref={ref} className={cx('ore-card__footer', className)} style={style}>
    {children}
  </div>
);
