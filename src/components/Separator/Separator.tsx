import { type FC, type HTMLAttributes } from 'react';
import cx from 'clsx';
import './Separator.scss';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Orientation of the dividing line. Defaults to 'horizontal'. */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Separator following the GtkSeparator control semantics.
 *
 * A thin horizontal or vertical rule used to visually divide groups of
 * content, as described in the GNOME HIG. Rendered as a `separator` role
 * element that exposes the current `aria-orientation`.
 */
export const Separator: FC<SeparatorProps> = ({ orientation = 'horizontal', className, style, ...rest }) => {
  return (
    <div
      {...rest}
      role="separator"
      aria-orientation={orientation}
      className={cx('ore-separator', { 'ore-separator--vertical': orientation === 'vertical' }, className)}
      style={style}
    />
  );
};
