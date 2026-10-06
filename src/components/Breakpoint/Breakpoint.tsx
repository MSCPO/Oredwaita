/* eslint-disable react-refresh/only-export-components */
import { type FC, type ReactNode, type RefObject, useEffect, useRef, useState } from 'react';
import cx from 'clsx';
import './Breakpoint.scss';

export type BreakpointSize = 'small' | 'medium' | 'large';

export interface UseBreakpointOptions {
  ref?: RefObject<HTMLElement | null>;
  smallThreshold?: number;
  mediumThreshold?: number;
  target?: 'container' | 'window';
}

export interface BreakpointState {
  breakpoint: BreakpointSize;
  width: number;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
}

export const getBreakpoint = (width: number, smallThreshold = 600, mediumThreshold = 900): BreakpointSize => {
  if (width < smallThreshold) {
    return 'small';
  }
  if (width < mediumThreshold) {
    return 'medium';
  }

  return 'large';
};

export const useBreakpoint = (options: UseBreakpointOptions = {}): BreakpointState => {
  const { ref, smallThreshold = 600, mediumThreshold = 900, target = 'container' } = options;

  const [state, setState] = useState<BreakpointState>(() => {
    const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const bp = getBreakpoint(initialWidth, smallThreshold, mediumThreshold);

    return {
      breakpoint: bp,
      width: initialWidth,
      isSmall: bp === 'small',
      isMedium: bp === 'medium',
      isLarge: bp === 'large',
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateState = (width: number) => {
      const bp = getBreakpoint(width, smallThreshold, mediumThreshold);
      setState({
        breakpoint: bp,
        width,
        isSmall: bp === 'small',
        isMedium: bp === 'medium',
        isLarge: bp === 'large',
      });
    };

    if (target === 'container' && ref?.current && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          const contentRect = entries[0].contentRect;
          updateState(contentRect.width);
        }
      });
      observer.observe(ref.current);

      return () => observer.disconnect();
    } else {
      const handleResize = () => {
        const width =
          target === 'container' && ref?.current ? ref.current.getBoundingClientRect().width : window.innerWidth;
        updateState(width);
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      return () => window.removeEventListener('resize', handleResize);
    }
  }, [ref, smallThreshold, mediumThreshold, target]);

  return state;
};

export interface BreakpointBinProps {
  children?: ReactNode | ((state: BreakpointState) => ReactNode);
  smallThreshold?: number;
  mediumThreshold?: number;
  target?: 'container' | 'window';
  className?: string;
  onBreakpointChange?: (breakpoint: BreakpointSize) => void;
}

export const BreakpointBin: FC<BreakpointBinProps> = ({
  children,
  smallThreshold = 600,
  mediumThreshold = 900,
  target = 'container',
  className,
  onBreakpointChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const state = useBreakpoint({
    ref: containerRef,
    smallThreshold,
    mediumThreshold,
    target,
  });

  const prevBpRef = useRef<BreakpointSize>(state.breakpoint);

  useEffect(() => {
    if (prevBpRef.current !== state.breakpoint) {
      prevBpRef.current = state.breakpoint;
      onBreakpointChange?.(state.breakpoint);
    }
  }, [state.breakpoint, onBreakpointChange]);

  return (
    <div ref={containerRef} className={cx('ore-breakpoint-bin', `ore-breakpoint-bin--${state.breakpoint}`, className)}>
      {typeof children === 'function' ? children(state) : children}
    </div>
  );
};
