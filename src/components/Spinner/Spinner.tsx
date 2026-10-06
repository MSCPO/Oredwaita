import { type FC } from 'react';
import cx from 'clsx';

import { useOreLabels } from '../ThemeProvider/ThemeProvider';
import './Spinner.scss';

export interface SpinnerProps {
  size?: number;
  /** Accessible name of the busy indicator; falls back to the localized loading label. */
  loadingLabel?: string;
  className?: string;
}

export const Spinner: FC<SpinnerProps> = ({ size = 24, loadingLabel, className }) => {
  const labels = useOreLabels();

  return (
    <div
      className={cx('ore-spinner', className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label={loadingLabel ?? labels.loading}
    />
  );
};
