import { type FC, type HTMLAttributes, type ReactNode } from 'react';
import cx from 'clsx';

import { Button } from '../Button/Button';
import { useOreLabels } from '../ThemeProvider/ThemeProvider';
import './HeaderBar.scss';

export interface WindowTitleProps {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}

export const WindowTitle: FC<WindowTitleProps> = ({ title, subtitle, className }) => {
  return (
    <div className={cx('ore-window-title', className)}>
      <div className="ore-window-title__title">{title}</div>
      {subtitle && <div className="ore-window-title__subtitle">{subtitle}</div>}
    </div>
  );
};

export interface HeaderBarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  titleWidget?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  startTitleButtons?: ReactNode;
  endTitleButtons?: ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backIcon?: ReactNode;
  /** Accessible label of the back button; falls back to the localized back label. */
  backLabel?: string;
  flat?: boolean;
  className?: string;
}

export const HeaderBar: FC<HeaderBarProps> = ({
  titleWidget,
  title,
  subtitle,
  startTitleButtons,
  endTitleButtons,
  showBackButton = false,
  onBackClick,
  backIcon = '←',
  backLabel,
  flat = false,
  className,
  style,
  ...rest
}) => {
  const labels = useOreLabels();

  return (
    <header {...rest} className={cx('ore-header-bar', { 'ore-header-bar--flat': flat }, className)} style={style}>
      <div className="ore-header-bar__start">
        {showBackButton && (
          <Button
            variant="flat"
            shape="circular"
            onClick={onBackClick}
            aria-label={backLabel ?? labels.back}
            className="ore-header-bar__back-btn"
          >
            {backIcon}
          </Button>
        )}
        {startTitleButtons}
      </div>

      <div className="ore-header-bar__center">
        {titleWidget ? titleWidget : <WindowTitle title={title} subtitle={subtitle} />}
      </div>

      <div className="ore-header-bar__end">{endTitleButtons}</div>
    </header>
  );
};
