import { type CSSProperties, type RefObject, useLayoutEffect, useRef, useState } from 'react';

export type AnchoredPlacement = 'bottom' | 'top' | 'left' | 'right';

/** Space between the anchor edge and the floating element, mirroring the popover offset in Popover.scss. */
const GAP = 8;
/** Minimum distance kept between the floating element and the viewport edges. */
const VIEWPORT_PADDING = 8;

export interface UseAnchoredPositionOptions {
  /** Element the floating node is anchored to; positioning is skipped while it is absent. */
  anchorRef?: RefObject<HTMLElement | null>;
  placement?: AnchoredPlacement;
  active: boolean;
}

export interface UseAnchoredPositionResult {
  ref: RefObject<HTMLDivElement | null>;
  style: CSSProperties;
}

/**
 * Fixed positioning for portal-rendered floating elements such as popovers: measures
 * the anchor and the floating node, flips the placement when it would overflow the
 * viewport, clamps the result, and follows resizes, scrolls and size changes.
 */
export const useAnchoredPosition = ({ anchorRef, placement = 'bottom', active }: UseAnchoredPositionOptions): UseAnchoredPositionResult => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!active) {
      return;
    }

    const update = () => {
      const anchor = anchorRef?.current;
      const node = ref.current;
      if (!anchor || !node) {
        return;
      }
      const anchorRect = anchor.getBoundingClientRect();
      const { width, height } = node.getBoundingClientRect();

      let resolved = placement;
      if (placement === 'bottom' && anchorRect.bottom + GAP + height > window.innerHeight - VIEWPORT_PADDING) {
        resolved = 'top';
      } else if (placement === 'top' && anchorRect.top - GAP - height < VIEWPORT_PADDING) {
        resolved = 'bottom';
      } else if (placement === 'right' && anchorRect.right + GAP + width > window.innerWidth - VIEWPORT_PADDING) {
        resolved = 'left';
      } else if (placement === 'left' && anchorRect.left - GAP - width < VIEWPORT_PADDING) {
        resolved = 'right';
      }

      let top: number;
      let left: number;
      if (resolved === 'bottom' || resolved === 'top') {
        left = anchorRect.left + anchorRect.width / 2 - width / 2;
        top = resolved === 'bottom' ? anchorRect.bottom + GAP : anchorRect.top - GAP - height;
      } else {
        top = anchorRect.top + anchorRect.height / 2 - height / 2;
        left = resolved === 'right' ? anchorRect.right + GAP : anchorRect.left - GAP - width;
      }

      setPosition({
        top: Math.max(VIEWPORT_PADDING, Math.min(top, window.innerHeight - VIEWPORT_PADDING - height)),
        left: Math.max(VIEWPORT_PADDING, Math.min(left, window.innerWidth - VIEWPORT_PADDING - width)),
      });
    };

    update();

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { capture: true });
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null;
    if (observer && ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      observer?.disconnect();
    };
  }, [active, anchorRef, placement]);

  return {
    ref,
    style: {
      position: 'fixed',
      top: position ? `${position.top}px` : undefined,
      left: position ? `${position.left}px` : undefined,
    },
  };
};
