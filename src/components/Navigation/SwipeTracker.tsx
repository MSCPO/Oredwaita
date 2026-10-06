/* eslint-disable react-refresh/only-export-components */
import { type FC, type ReactNode, useEffect, useRef } from 'react';
import cx from 'clsx';

export interface SwipeTrackerOptions {
  onSwipeStart?: () => void;
  onSwipeProgress?: (distance: number) => void;
  onSwipeEnd?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  enabled?: boolean;
}

export const useSwipeTracker = <T extends HTMLElement = HTMLDivElement>(options: SwipeTrackerOptions = {}) => {
  const ref = useRef<T>(null);
  // Options are read through a ref so callers can pass fresh object literals each render
  // without tearing down in-flight touch listeners.
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  const enabled = options.enabled !== false;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) {
      return;
    }

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        return;
      }
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      optionsRef.current.onSwipeStart?.();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        return;
      }
      const dx = e.touches[0].clientX - startX;
      optionsRef.current.onSwipeProgress?.(dx);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length !== 1) {
        return;
      }
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 50) {
          optionsRef.current.onSwipeEnd?.('right');
        } else if (dx < -50) {
          optionsRef.current.onSwipeEnd?.('left');
        }
      } else {
        if (dy > 50) {
          optionsRef.current.onSwipeEnd?.('down');
        } else if (dy < -50) {
          optionsRef.current.onSwipeEnd?.('up');
        }
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled]);

  return ref;
};

export interface SwipeableProps {
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  children: ReactNode;
  className?: string;
}

export const Swipeable: FC<SwipeableProps> = ({ onSwipeRight, onSwipeLeft, children, className }) => {
  const ref = useSwipeTracker<HTMLDivElement>({
    onSwipeEnd: (dir) => {
      if (dir === 'right') {
        onSwipeRight?.();
      }
      if (dir === 'left') {
        onSwipeLeft?.();
      }
    },
  });

  return (
    <div ref={ref} className={cx('ore-swipeable', className)}>
      {children}
    </div>
  );
};
