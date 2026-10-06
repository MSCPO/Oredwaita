import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { BreakpointBin, getBreakpoint, useBreakpoint, type UseBreakpointOptions } from './Breakpoint';

/**
 * Controllable ResizeObserver replacement so observer-driven updates can be
 * simulated deterministically in jsdom.
 */
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];

  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }

  observe = vi.fn();

  unobserve = vi.fn();

  disconnect = vi.fn();

  trigger(width: number): void {
    const entry = { contentRect: { width } } as unknown as ResizeObserverEntry;

    this.callback([entry], this as unknown as ResizeObserver);
  }
}

const innerWidthDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth');

const setWindowWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
};

beforeEach(() => {
  FakeResizeObserver.instances = [];
});

afterEach(() => {
  if (innerWidthDescriptor) {
    Object.defineProperty(window, 'innerWidth', innerWidthDescriptor);
  } else {
    delete (window as { innerWidth?: unknown }).innerWidth;
  }
  vi.unstubAllGlobals();
});

const BreakpointProbe = (options: UseBreakpointOptions = {}) => {
  const probeRef = useRef<HTMLDivElement>(null);
  const state = useBreakpoint({ ...options, ref: probeRef });

  return (
    <div ref={probeRef} data-testid="probe">
      {state.breakpoint}:{state.width}
    </div>
  );
};

describe('getBreakpoint()', () => {
  it('should map widths below the small threshold to small', () => {
    expect(getBreakpoint(599)).toBe('small');
  });

  it('should map widths between the thresholds to medium', () => {
    expect(getBreakpoint(600)).toBe('medium');
    expect(getBreakpoint(899)).toBe('medium');
  });

  it('should map widths from the medium threshold up to large', () => {
    expect(getBreakpoint(900)).toBe('large');
  });

  it('should honor custom thresholds', () => {
    expect(getBreakpoint(40, 50, 200)).toBe('small');
    expect(getBreakpoint(100, 50, 200)).toBe('medium');
    expect(getBreakpoint(250, 50, 200)).toBe('large');
  });
});

describe('<useBreakpoint />', () => {
  it('should derive the initial state from window.innerWidth', () => {
    setWindowWidth(700);
    render(<BreakpointProbe target="window" />);

    expect(screen.getByTestId('probe')).toHaveTextContent('medium:700');
  });

  it('should update state from ResizeObserver contentRect widths', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    setWindowWidth(1024);
    render(<BreakpointProbe />);

    const observer = FakeResizeObserver.instances.at(-1);
    expect(observer).toBeDefined();
    expect(observer?.observe).toHaveBeenCalledWith(expect.any(HTMLElement));

    act(() => observer?.trigger(320));
    expect(screen.getByTestId('probe')).toHaveTextContent('small:320');

    act(() => observer?.trigger(1000));
    expect(screen.getByTestId('probe')).toHaveTextContent('large:1000');
  });

  it('should fall back to the container rect when ResizeObserver is unavailable', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    setWindowWidth(1024);
    render(<BreakpointProbe />);

    // jsdom reports a 0px content rect, which maps to the small breakpoint.
    expect(screen.getByTestId('probe')).toHaveTextContent('small:0');
  });

  it('should fall back to window resize events when ResizeObserver is unavailable', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    setWindowWidth(700);
    render(<BreakpointProbe target="window" />);

    expect(screen.getByTestId('probe')).toHaveTextContent('medium:700');

    setWindowWidth(1200);
    fireEvent(window, new Event('resize'));
    expect(screen.getByTestId('probe')).toHaveTextContent('large:1200');
  });
});

describe('<BreakpointBin />', () => {
  it('should render children with a breakpoint class from window.innerWidth', () => {
    setWindowWidth(700);
    const { container } = render(
      <BreakpointBin>
        <p>Bin content</p>
      </BreakpointBin>,
    );

    expect(screen.getByText('Bin content')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('ore-breakpoint-bin', 'ore-breakpoint-bin--medium');
  });

  it('should expose boolean flags through function children', () => {
    setWindowWidth(1000);
    render(
      <BreakpointBin>
        {(state) => <p>{`${state.breakpoint} ${state.isSmall} ${state.isMedium} ${state.isLarge}`}</p>}
      </BreakpointBin>,
    );

    expect(screen.getByText('large false false true')).toBeInTheDocument();
  });

  it('should merge the className', () => {
    setWindowWidth(1024);
    const { container } = render(<BreakpointBin className="custom-bin">Content</BreakpointBin>);

    expect(container.firstElementChild).toHaveClass('ore-breakpoint-bin--large', 'custom-bin');
  });

  it('should call onBreakpointChange when the breakpoint changes', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    setWindowWidth(1024);
    const onBreakpointChange = vi.fn();
    const { container } = render(
      <BreakpointBin onBreakpointChange={onBreakpointChange}>
        <p>Content</p>
      </BreakpointBin>,
    );

    const observer = FakeResizeObserver.instances.at(-1);
    act(() => observer?.trigger(320));

    expect(onBreakpointChange).toHaveBeenCalledTimes(1);
    expect(onBreakpointChange).toHaveBeenCalledWith('small');
    expect(container.firstElementChild).toHaveClass('ore-breakpoint-bin--small');

    act(() => observer?.trigger(300));
    expect(onBreakpointChange).toHaveBeenCalledTimes(1);
  });
});
