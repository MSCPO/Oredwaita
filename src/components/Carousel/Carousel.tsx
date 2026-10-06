import { Children, type FC, type ReactNode, useState } from 'react';
import cx from 'clsx';

import { useOreLabels } from '../ThemeProvider/ThemeProvider';
import './Carousel.scss';

export interface CarouselIndicatorProps {
  count: number;
  activePage: number;
  onSelect?: (index: number) => void;
  /**
   * Builds the accessible label of an indicator from its 1-based slide number;
   * falls back to the localized go-to-slide label.
   */
  goToSlideLabel?: (index: number) => string;
  className?: string;
}

export const CarouselIndicatorDots: FC<CarouselIndicatorProps> = ({
  count,
  activePage,
  onSelect,
  goToSlideLabel,
  className,
}) => {
  const labels = useOreLabels();

  return (
    <div className={cx('ore-carousel-dots', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect?.(i)}
          className={cx('ore-carousel-dots__dot', {
            'ore-carousel-dots__dot--active': i === activePage,
          })}
          aria-label={(goToSlideLabel ?? labels.goToSlide)(i + 1)}
        />
      ))}
    </div>
  );
};

export interface CarouselProps {
  children: ReactNode[];
  page?: number;
  onPageChanged?: (page: number) => void;
  /** Builds the accessible label of an indicator from its 1-based slide number. */
  goToSlideLabel?: (index: number) => string;
  className?: string;
}

export const Carousel: FC<CarouselProps> = ({
  children,
  page: controlledPage,
  onPageChanged,
  goToSlideLabel,
  className,
}) => {
  const [internalPage, setInternalPage] = useState(0);
  const activePage = controlledPage !== undefined ? controlledPage : internalPage;

  const count = Children.count(children);

  const handlePageChange = (index: number) => {
    if (controlledPage === undefined) {
      setInternalPage(index);
    }
    onPageChanged?.(index);
  };

  return (
    <div className={cx('ore-carousel', className)}>
      <div className="ore-carousel__track" style={{ transform: `translateX(-${activePage * 100}%)` }}>
        {Children.map(children, (child, idx) => (
          <div key={idx} className="ore-carousel__slide">
            {child}
          </div>
        ))}
      </div>
      <CarouselIndicatorDots
        count={count}
        activePage={activePage}
        onSelect={handlePageChange}
        goToSlideLabel={goToSlideLabel}
      />
    </div>
  );
};

export const CarouselIndicatorLines: FC<CarouselIndicatorProps> = ({
  count,
  activePage,
  onSelect,
  goToSlideLabel,
  className,
}) => {
  const labels = useOreLabels();

  return (
    <div className={cx('ore-carousel-lines', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect?.(i)}
          className={cx('ore-carousel-lines__line', {
            'ore-carousel-lines__line--active': i === activePage,
          })}
          aria-label={(goToSlideLabel ?? labels.goToSlide)(i + 1)}
        />
      ))}
    </div>
  );
};
