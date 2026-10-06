/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- a focusable separator with aria-valuenow is an interactive widget per the ARIA authoring practices */
import {
  type FC,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import cx from 'clsx';

import { useOreLabels } from '../ThemeProvider/ThemeProvider';
import './Paned.scss';

const DEFAULT_POSITION = 200;
const KEYBOARD_STEP = 10;

export interface PanedProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Ref forwarded to the root element. */
  ref?: Ref<HTMLDivElement>;
  /** Split direction; 'horizontal' places the start pane on the left. Defaults to 'horizontal'. */
  orientation?: 'horizontal' | 'vertical';
  /** Content of the start (first) pane. */
  start?: ReactNode;
  /** Content of the end (second) pane. */
  end?: ReactNode;
  /** Controlled size of the start pane in px; takes precedence over `defaultPosition`. */
  position?: number;
  /** Initial start-pane size in px for uncontrolled usage. Defaults to 200. */
  defaultPosition?: number;
  /** Called with the next clamped start-pane size while the user resizes. */
  onPositionChange?: (position: number) => void;
  /** Lower bound of the start-pane size in px. Defaults to 0. */
  minPosition?: number;
  /** Upper bound of the start-pane size in px; falls back to the container size. */
  maxPosition?: number;
}

/**
 * Paned following the GtkPaned control semantics.
 *
 * Divides its area into two panes separated by a draggable, keyboard-operable
 * handle, as described in the GNOME HIG. The start pane is sized in pixels by
 * `position` / `defaultPosition`, while the end pane takes the remaining space.
 */
export const Paned: FC<PanedProps> = ({
  ref,
  orientation = 'horizontal',
  start,
  end,
  position: controlledPosition,
  defaultPosition = DEFAULT_POSITION,
  onPositionChange,
  minPosition,
  maxPosition,
  className,
  style,
  ...rest
}) => {
  const labels = useOreLabels();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragOriginRef = useRef<{ pointer: number; position: number } | null>(null);
  const lastEmittedRef = useRef<number | null>(null);
  const [internalPosition, setInternalPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const position = controlledPosition !== undefined ? controlledPosition : internalPosition;
  const isHorizontal = orientation === 'horizontal';

  const measureContainer = useCallback((): number => {
    const node = rootRef.current;
    if (!node) {
      return 0;
    }

    return isHorizontal ? node.offsetWidth : node.offsetHeight;
  }, [isHorizontal]);

  const clampPosition = useCallback(
    (next: number): number => {
      const containerSize = measureContainer();
      const min = minPosition ?? 0;
      const max = maxPosition ?? (containerSize > 0 ? containerSize : Number.POSITIVE_INFINITY);

      return Math.min(Math.max(next, min), max);
    },
    [measureContainer, minPosition, maxPosition],
  );

  const commitPosition = useCallback(
    (next: number) => {
      if (controlledPosition === undefined) {
        setInternalPosition(next);
      }
      onPositionChange?.(next);
    },
    [controlledPosition, onPositionChange],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    dragOriginRef.current = {
      pointer: isHorizontal ? event.clientX : event.clientY,
      position: clampPosition(position),
    };
    lastEmittedRef.current = position;
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) {
      return;
    }
    const handlePointerMove = (event: PointerEvent) => {
      const origin = dragOriginRef.current;
      if (!origin) {
        return;
      }
      const pointer = isHorizontal ? event.clientX : event.clientY;
      const next = clampPosition(origin.position + (pointer - origin.pointer));
      if (Number.isFinite(next) && next !== lastEmittedRef.current) {
        lastEmittedRef.current = next;
        commitPosition(next);
      }
    };
    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, isHorizontal, clampPosition, commitPosition]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let target: number | null = null;
    if (isHorizontal && event.key === 'ArrowLeft') {
      target = position - KEYBOARD_STEP;
    } else if (isHorizontal && event.key === 'ArrowRight') {
      target = position + KEYBOARD_STEP;
    } else if (!isHorizontal && event.key === 'ArrowUp') {
      target = position - KEYBOARD_STEP;
    } else if (!isHorizontal && event.key === 'ArrowDown') {
      target = position + KEYBOARD_STEP;
    } else if (event.key === 'Home') {
      target = minPosition ?? 0;
    } else if (event.key === 'End') {
      const containerSize = measureContainer();
      target = maxPosition ?? (containerSize > 0 ? containerSize : null);
    }
    if (target === null) {
      return;
    }
    event.preventDefault();
    const next = clampPosition(target);
    if (Number.isFinite(next) && next !== position) {
      commitPosition(next);
    }
  };

  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <div
      {...rest}
      ref={setRootRef}
      className={cx('ore-paned', `ore-paned--${orientation}`, { 'ore-paned--dragging': isDragging }, className)}
      style={style}
    >
      <div className="ore-paned__pane ore-paned__pane--start" style={{ flexBasis: `${position}px` }}>
        {start}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
        aria-valuenow={position}
        aria-valuemin={minPosition ?? 0}
        aria-valuemax={maxPosition}
        aria-label={labels.resize}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        className={cx('ore-paned__handle', { 'ore-paned__handle--dragging': isDragging })}
      />
      <div className="ore-paned__pane ore-paned__pane--end">{end}</div>
    </div>
  );
};
