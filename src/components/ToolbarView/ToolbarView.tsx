import React, { type FC, type ReactNode } from 'react';
import cx from 'clsx';
import './ToolbarView.scss';

export interface ToolbarViewProps {
  topBars?: ReactNode | ReactNode[];
  content?: ReactNode;
  bottomBars?: ReactNode | ReactNode[];
  revealTopBars?: boolean;
  revealBottomBars?: boolean;
  extendContentToTop?: boolean;
  extendContentToBottom?: boolean;
  className?: string;
  children?: ReactNode;
}

export const ToolbarView: FC<ToolbarViewProps> = ({
  topBars,
  content,
  bottomBars,
  revealTopBars = true,
  revealBottomBars = true,
  extendContentToTop = false,
  extendContentToBottom = false,
  className,
  children,
}) => {
  const topBarsArray = Array.isArray(topBars) ? topBars : topBars ? [topBars] : [];
  const bottomBarsArray = Array.isArray(bottomBars) ? bottomBars : bottomBars ? [bottomBars] : [];

  return (
    <div className={cx('ore-toolbar-view', className)}>
      {topBarsArray.length > 0 && (
        <div
          className={cx('ore-toolbar-view__top-bars', {
            'ore-toolbar-view__top-bars--hidden': !revealTopBars,
          })}
        >
          {topBarsArray.map((bar, idx) => (
            <React.Fragment key={idx}>{bar}</React.Fragment>
          ))}
        </div>
      )}

      <div
        className={cx('ore-toolbar-view__content', {
          'ore-toolbar-view__content--extend-top': extendContentToTop,
          'ore-toolbar-view__content--extend-bottom': extendContentToBottom,
        })}
      >
        {content || children}
      </div>

      {bottomBarsArray.length > 0 && (
        <div
          className={cx('ore-toolbar-view__bottom-bars', {
            'ore-toolbar-view__bottom-bars--hidden': !revealBottomBars,
          })}
        >
          {bottomBarsArray.map((bar, idx) => (
            <React.Fragment key={idx}>{bar}</React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
