import { type FC, type HTMLAttributes, type ReactNode } from 'react';
import cx from 'clsx';

import './Banner.scss';

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  /** Custom action area rendered at the tail of the banner; compose any number of Buttons here. */
  actions?: ReactNode;
  /** Optional leading icon rendered before the title. */
  icon?: ReactNode;
  revealed?: boolean;
}

export const Banner: FC<BannerProps> = ({ title, actions, icon, revealed = true, className, style, ...rest }) => {
  if (!revealed) {
    return null;
  }

  return (
    <div {...rest} className={cx('ore-banner', className)} style={style}>
      {icon && <span className="ore-banner__icon">{icon}</span>}
      <span className="ore-banner__title">{title}</span>
      {actions}
    </div>
  );
};
