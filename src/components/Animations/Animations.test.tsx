import { type FC } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

import {
  AnimatedTransition,
  easeOutCubic,
  type SpringConfig,
  type TimedConfig,
  useSpringAnimation,
  useTimedAnimation,
} from './Animations';

interface TimedHarnessProps {
  target: number;
  config?: TimedConfig;
}

const TimedHarness: FC<TimedHarnessProps> = ({ target, config }) => {
  const { value, progress, isAnimating, reset } = useTimedAnimation(target, config);

  return (
    <div>
      <div data-testid="timed-state" data-value={value} data-progress={progress} data-animating={String(isAnimating)} />
      <button type="button" onClick={() => reset(7)}>
        Reset timed
      </button>
    </div>
  );
};

interface SpringHarnessProps {
  target: number;
  config?: SpringConfig;
}

const SpringHarness: FC<SpringHarnessProps> = ({ target, config }) => {
  const { value, velocity, isAnimating, reset } = useSpringAnimation(target, config);

  return (
    <div>
      <div
        data-testid="spring-state"
        data-value={value}
        data-velocity={velocity}
        data-animating={String(isAnimating)}
      />
      <button type="button" onClick={() => reset(0)}>
        Reset spring
      </button>
    </div>
  );
};

describe('<AnimatedTransition />', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const ui = (show: boolean, props: { unmountOnExit?: boolean; type?: 'slide-up' } = {}) => (
    <AnimatedTransition show={show} {...props}>
      <p>Animated content</p>
    </AnimatedTransition>
  );

  it('should render its children while shown', () => {
    const { container } = render(ui(true));

    expect(screen.getByText('Animated content')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('ore-animated-transition', 'ore-animated-transition--fade');
  });

  it('should use the configured transition type as a class', () => {
    const { container } = render(ui(true, { type: 'slide-up' }));

    expect(container.firstElementChild).toHaveClass('ore-animated-transition--slide-up');
  });

  it('should keep hidden children mounted when unmountOnExit is not set', () => {
    const { container, rerender } = render(ui(true));
    rerender(ui(false));

    expect(screen.getByText('Animated content')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('ore-animated-transition--fade--hidden');
  });

  it('should unmount hidden children after the transition when unmountOnExit is set', () => {
    const { container, rerender } = render(ui(true, { unmountOnExit: true }));
    rerender(ui(false, { unmountOnExit: true }));

    expect(screen.getByText('Animated content')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('ore-animated-transition--fade--hidden');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByText('Animated content')).not.toBeInTheDocument();
    expect(container.firstElementChild).toBeNull();
  });

  it('should render again after being hidden and unmounted', () => {
    const { rerender } = render(ui(true, { unmountOnExit: true }));
    rerender(ui(false, { unmountOnExit: true }));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByText('Animated content')).not.toBeInTheDocument();

    rerender(ui(true, { unmountOnExit: true }));

    expect(screen.getByText('Animated content')).toBeInTheDocument();
    expect(screen.queryByText('Animated content')?.parentElement).not.toHaveClass(
      'ore-animated-transition--fade--hidden',
    );
  });
});

describe('easeOutCubic()', () => {
  it('should map 0 to 0, 1 to 1 and 0.5 to 0.875', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBe(0.875);
  });
});

describe('<useTimedAnimation />', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('should start at rest on the initial target', () => {
    render(<TimedHarness target={50} />);

    const state = screen.getByTestId('timed-state');
    expect(state).toHaveAttribute('data-value', '50');
    expect(state).toHaveAttribute('data-progress', '1');
    expect(state).toHaveAttribute('data-animating', 'false');
  });

  it('should animate towards a new target and complete', () => {
    const onComplete = vi.fn();
    const { rerender } = render(<TimedHarness target={0} config={{ duration: 100, onComplete }} />);
    rerender(<TimedHarness target={100} config={{ duration: 100, onComplete }} />);

    act(() => {
      vi.advanceTimersByTime(16);
    });
    const state = screen.getByTestId('timed-state');
    expect(state).toHaveAttribute('data-animating', 'true');
    expect(state).toHaveAttribute('data-progress', '0');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(state).toHaveAttribute('data-value', '100');
    expect(state).toHaveAttribute('data-progress', '1');
    expect(state).toHaveAttribute('data-animating', 'false');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should hold the start value until the delay has elapsed', () => {
    const { rerender } = render(<TimedHarness target={0} config={{ duration: 100, delay: 200 }} />);
    rerender(<TimedHarness target={100} config={{ duration: 100, delay: 200 }} />);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    const state = screen.getByTestId('timed-state');
    expect(state).toHaveAttribute('data-value', '0');
    expect(state).toHaveAttribute('data-animating', 'true');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(state).toHaveAttribute('data-value', '100');
    expect(state).toHaveAttribute('data-animating', 'false');
  });

  it('should restart from the value given to reset()', () => {
    const { rerender } = render(<TimedHarness target={0} config={{ duration: 100 }} />);
    rerender(<TimedHarness target={100} config={{ duration: 100 }} />);
    act(() => {
      vi.advanceTimersByTime(16);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset timed' }));

    const state = screen.getByTestId('timed-state');
    expect(state).toHaveAttribute('data-value', '7');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(state).toHaveAttribute('data-value', '100');
  });
});

describe('<useSpringAnimation />', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('should start at rest on the initial target', () => {
    render(<SpringHarness target={50} />);

    const state = screen.getByTestId('spring-state');
    expect(state).toHaveAttribute('data-value', '50');
    expect(state).toHaveAttribute('data-velocity', '0');
    expect(state).toHaveAttribute('data-animating', 'false');
  });

  it('should settle on a new target and fire onRest', () => {
    const onRest = vi.fn();
    const { rerender } = render(<SpringHarness target={0} config={{ onRest }} />);
    rerender(<SpringHarness target={100} config={{ onRest }} />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const state = screen.getByTestId('spring-state');
    expect(Number(state.getAttribute('data-value'))).toBeCloseTo(100, 4);
    expect(state).toHaveAttribute('data-animating', 'false');
    // The initial at-rest frame is cancelled by the rerender, so only the settled transition rests.
    expect(onRest).toHaveBeenCalledTimes(1);
  });

  it('should stop at the value given to reset() without further frames', () => {
    const { rerender } = render(<SpringHarness target={0} />);
    rerender(<SpringHarness target={100} />);
    const state = screen.getByTestId('spring-state');
    expect(state).toHaveAttribute('data-animating', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Reset spring' }));

    expect(state).toHaveAttribute('data-value', '0');
    expect(state).toHaveAttribute('data-animating', 'false');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(state).toHaveAttribute('data-value', '0');
    expect(state).toHaveAttribute('data-animating', 'false');
  });
});
