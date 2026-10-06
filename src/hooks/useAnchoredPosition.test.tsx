import { type FC, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import { useAnchoredPosition } from './useAnchoredPosition';

const asRect = (left: number, top: number, width: number, height: number): DOMRect =>
  ({
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => null,
  }) as DOMRect;

interface AnchoredHarnessProps {
  placement?: 'bottom' | 'top' | 'left' | 'right';
  active?: boolean;
}

const AnchoredHarness: FC<AnchoredHarnessProps> = ({ placement = 'bottom', active = true }) => {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const { ref, style } = useAnchoredPosition({ anchorRef, placement, active });

  return (
    <>
      <button type="button" id="anchor" ref={anchorRef}>
        Anchor
      </button>
      <div ref={ref} data-testid="floating" style={style}>
        Floating content
      </div>
    </>
  );
};

describe('useAnchoredPosition()', () => {
  beforeEach(() => {
    vi.stubGlobal('innerWidth', 1024);
    vi.stubGlobal('innerHeight', 768);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const stubRects = (anchor: DOMRect, floating: DOMRect) =>
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      return this.id === 'anchor' ? anchor : floating;
    });

  it('should place the floating element below the anchor and clamp it into the viewport', () => {
    stubRects(asRect(0, 0, 100, 40), asRect(0, 0, 200, 100));
    render(<AnchoredHarness />);

    const floating = screen.getByTestId('floating');
    expect(floating.style.position).toBe('fixed');
    expect(floating.style.top).toBe('48px');
    expect(parseInt(floating.style.left, 10)).toBeGreaterThanOrEqual(0);
  });

  it('should flip above the anchor when there is no room below in the viewport', () => {
    stubRects(asRect(0, 620, 100, 80), asRect(0, 0, 200, 100));
    render(<AnchoredHarness />);

    expect(screen.getByTestId('floating').style.top).toBe('512px');
  });

  it('should place the floating element to the right of the anchor for the right placement', () => {
    stubRects(asRect(0, 0, 100, 40), asRect(0, 0, 200, 100));
    render(<AnchoredHarness placement="right" />);

    const floating = screen.getByTestId('floating');
    expect(floating.style.left).toBe('108px');
    expect(parseInt(floating.style.top, 10)).toBeGreaterThanOrEqual(0);
  });

  it('should reposition when the window is resized', () => {
    const rects = stubRects(asRect(0, 0, 100, 40), asRect(0, 0, 200, 100));
    render(<AnchoredHarness placement="right" />);
    expect(screen.getByTestId('floating').style.left).toBe('108px');

    rects.mockImplementation(function (this: Element) {
      return this.id === 'anchor' ? asRect(300, 0, 100, 40) : asRect(0, 0, 200, 100);
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByTestId('floating').style.left).toBe('408px');
  });

  it('should not compute a position while inactive', () => {
    stubRects(asRect(0, 0, 100, 40), asRect(0, 0, 200, 100));
    render(<AnchoredHarness active={false} />);

    const floating = screen.getByTestId('floating');
    expect(floating.style.top).toBe('');
    expect(floating.style.left).toBe('');
  });
});
