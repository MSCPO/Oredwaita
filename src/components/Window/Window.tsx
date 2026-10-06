import { type CSSProperties, type FC, type HTMLAttributes, type ReactNode } from 'react';
import cx from 'clsx';

import { HeaderBar, type HeaderBarProps } from '../HeaderBar/HeaderBar';
import { StatusPage, type StatusPageProps } from '../StatusPage/StatusPage';
import { useOreLabels } from '../ThemeProvider/ThemeProvider';
import './Window.scss';

export interface WindowControlsProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  /** Accessible name of the close button; falls back to the localized close label. */
  closeLabel?: string;
  /** Accessible name of the minimize button; falls back to the localized minimize label. */
  minimizeLabel?: string;
  /** Accessible name of the maximize button; falls back to the localized maximize label. */
  maximizeLabel?: string;
  className?: string;
}

export const WindowControls: FC<WindowControlsProps> = ({
  onClose,
  onMinimize,
  onMaximize,
  closeLabel,
  minimizeLabel,
  maximizeLabel,
  className,
}) => {
  const labels = useOreLabels();
  const resolvedCloseLabel = closeLabel ?? labels.close;
  const resolvedMinimizeLabel = minimizeLabel ?? labels.minimize;
  const resolvedMaximizeLabel = maximizeLabel ?? labels.maximize;

  return (
    <div className={cx('ore-window__controls', className)}>
      <button
        type="button"
        className="ore-window__control-btn ore-window__control-btn--close"
        onClick={onClose}
        aria-label={resolvedCloseLabel}
        title={resolvedCloseLabel}
      />
      <button
        type="button"
        className="ore-window__control-btn ore-window__control-btn--minimize"
        onClick={onMinimize}
        aria-label={resolvedMinimizeLabel}
        title={resolvedMinimizeLabel}
      />
      <button
        type="button"
        className="ore-window__control-btn ore-window__control-btn--maximize"
        onClick={onMaximize}
        aria-label={resolvedMaximizeLabel}
        title={resolvedMaximizeLabel}
      />
    </div>
  );
};

export interface WindowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  titlebar?: ReactNode;
  content?: ReactNode;
  resizable?: boolean;
  defaultWidth?: number | string;
  defaultHeight?: number | string;
  showControls?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const Window: FC<WindowProps> = ({
  titlebar,
  content,
  resizable = false,
  defaultWidth,
  defaultHeight,
  showControls = false,
  onClose,
  onMinimize,
  onMaximize,
  className,
  style,
  children,
  ...rest
}) => {
  const windowStyle: CSSProperties = {
    ...style,
    ...(defaultWidth !== undefined && {
      width: typeof defaultWidth === 'number' ? `${defaultWidth}px` : defaultWidth,
    }),
    ...(defaultHeight !== undefined && {
      height: typeof defaultHeight === 'number' ? `${defaultHeight}px` : defaultHeight,
    }),
  };

  return (
    <div
      {...rest}
      className={cx(
        'ore-window',
        {
          'ore-window--resizable': resizable,
        },
        className,
      )}
      style={windowStyle}
    >
      {(titlebar || showControls) && (
        <div className="ore-window__titlebar">
          {showControls && <WindowControls onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} />}
          {titlebar}
        </div>
      )}
      <div className="ore-window__content">{content || children}</div>
    </div>
  );
};

export interface ApplicationWindowProps extends Omit<WindowProps, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  startTitleButtons?: ReactNode;
  endTitleButtons?: ReactNode;
  headerBarProps?: Partial<HeaderBarProps>;
  statusPageProps?: StatusPageProps;
  showStatusPage?: boolean;
}

export const ApplicationWindow: FC<ApplicationWindowProps> = ({
  title,
  subtitle,
  startTitleButtons,
  endTitleButtons,
  headerBarProps,
  statusPageProps,
  showStatusPage = false,
  titlebar,
  showControls = true,
  onClose,
  onMinimize,
  onMaximize,
  children,
  content,
  className,
  ...restProps
}) => {
  const computedControls = showControls ? (
    <WindowControls onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} />
  ) : undefined;

  const defaultHeaderBar = (
    <HeaderBar
      title={title}
      subtitle={subtitle}
      startTitleButtons={
        startTitleButtons || (headerBarProps?.startTitleButtons ? headerBarProps.startTitleButtons : computedControls)
      }
      endTitleButtons={endTitleButtons || headerBarProps?.endTitleButtons}
      {...headerBarProps}
    />
  );

  const effectiveTitlebar = titlebar ?? defaultHeaderBar;

  return (
    <Window {...restProps} titlebar={effectiveTitlebar} className={cx('ore-application-window', className)}>
      <div className="ore-application-window__view">
        {showStatusPage && statusPageProps ? <StatusPage {...statusPageProps} /> : content || children}
      </div>
    </Window>
  );
};
