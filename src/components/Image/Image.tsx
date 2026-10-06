import { type FC, type ImgHTMLAttributes } from 'react';
import cx from 'clsx';
import './Image.scss';

export type ImageFit = 'cover' | 'contain' | 'fill' | 'scale-down';

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, never> {
  /**
   * How the image content is fitted into its box, mirroring the GTK
   * `content-fit` property. Defaults to 'contain', matching the
   * GtkPicture default.
   */
  fit?: ImageFit;
  /** Round the image corners with the large radius from the GNOME HIG. */
  rounded?: boolean;
}

/**
 * Image following the GtkPicture control semantics.
 *
 * Displays an image with `content-fit`-style scaling and an optional
 * large corner radius, as described in the GNOME HIG.
 */
export const Image: FC<ImageProps> = ({ fit = 'contain', rounded = false, className, style, alt, ...rest }) => {
  return (
    <img
      {...rest}
      alt={alt}
      className={cx('ore-image', `ore-image--fit-${fit}`, { 'ore-image--rounded': rounded }, className)}
      style={style}
    />
  );
};
