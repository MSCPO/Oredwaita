import { type RefObject, useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[contenteditable=""]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Open overlays in mount order; Escape only reaches the topmost entry. */
const overlayStack: object[] = [];

export interface UseOverlayBehaviorOptions {
  open: boolean;
  onClose?: () => void;
  containerRef: RefObject<HTMLElement | null>;
  /** Modal overlays trap Tab focus and receive initial focus; popovers only get Escape + focus restore. */
  modal?: boolean;
}

/** Escape-to-close, initial focus, Tab cycling and focus restoration for overlay components. */
export const useOverlayBehavior = ({ open, onClose, containerRef, modal = true }: UseOverlayBehaviorOptions) => {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const entry = {};
    overlayStack.push(entry);

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (modal) {
      container.focus();
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (overlayStack[overlayStack.length - 1] !== entry) {
          return;
        }
        event.stopPropagation();
        onCloseRef.current?.();

        return;
      }
      if (!modal || event.key !== 'Tab') {
        return;
      }
      const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) {
        event.preventDefault();
        container.focus();

        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const outside = !container.contains(active);
      if (event.shiftKey) {
        if (active === first || active === container || outside) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || active === container || outside) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      const entryIndex = overlayStack.indexOf(entry);
      if (entryIndex !== -1) {
        overlayStack.splice(entryIndex, 1);
      }
      document.removeEventListener('keydown', handleKeydown);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [open, modal, containerRef]);
};
