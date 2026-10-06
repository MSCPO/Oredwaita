import { type FC, type HTMLAttributes, type ReactNode, type Ref, useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import cx from 'clsx';

import './Expander.scss';

export interface ExpanderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'title'> {
  /** Heading of the always-visible header row; also its accessible name. */
  title: ReactNode;
  icon?: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  ref?: Ref<HTMLDivElement>;
}

/**
 * GNOME HIG style expander: a header button toggles a disclosure region, like
 * Gtk.Expander. The expanded state is exposed through aria-expanded on the header.
 */
export const Expander: FC<ExpanderProps> = ({
  title,
  icon,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  ref,
  className,
  style,
  children,
  ...rest
}) => {
  const headerId = useId();
  const regionId = useId();
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : uncontrolledExpanded;

  const toggle = () => {
    const next = !isExpanded;
    if (controlledExpanded === undefined) {
      setUncontrolledExpanded(next);
    }
    onExpandedChange?.(next);
  };

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('ore-expander', { 'ore-expander--expanded': isExpanded }, className)}
      style={style}
    >
      <button
        type="button"
        id={headerId}
        className="ore-expander__header"
        aria-expanded={isExpanded}
        aria-controls={regionId}
        onClick={toggle}
      >
        {icon && (
          <span className="ore-expander__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="ore-expander__title">{title}</span>
        <span aria-hidden="true" className={cx('ore-expander__chevron', { 'ore-expander__chevron--open': isExpanded })}>
          <ChevronDown size={16} />
        </span>
      </button>
      {isExpanded && (
        <div id={regionId} role="region" aria-labelledby={headerId} className="ore-expander__region">
          <div className="ore-expander__content">{children}</div>
        </div>
      )}
    </div>
  );
};
