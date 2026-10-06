import { type FC, type HTMLAttributes, type ReactNode } from 'react';
import cx from 'clsx';

import './StatusPage.scss';

export interface StatusPageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

export const StatusPage: FC<StatusPageProps> = ({ icon, title, description, children, className, style, ...rest }) => {
  return (
    <div {...rest} className={cx('ore-status-page', className)} style={style}>
      {icon && <div className="ore-status-page__icon">{icon}</div>}
      <h2 className="ore-status-page__title">{title}</h2>
      {description && <p className="ore-status-page__description">{description}</p>}
      {children && <div className="ore-status-page__child">{children}</div>}
    </div>
  );
};
