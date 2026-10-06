import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Badge, FadingLabel, LevelBar, ProgressBar, ShortcutLabel } from './Indicators';

const fillOf = (container: HTMLElement) => container.firstElementChild?.firstElementChild as HTMLElement;

describe('<ShortcutLabel />', () => {
  it('should render one kbd element per accelerator key', () => {
    const { container } = render(<ShortcutLabel accelerator="Ctrl+Shift+P" />);

    const keys = container.querySelectorAll('.ore-shortcut-label__kbd');
    expect(keys).toHaveLength(3);
    expect(keys[0]).toHaveTextContent('Ctrl');
    expect(keys[1]).toHaveTextContent('Shift');
    expect(keys[2]).toHaveTextContent('P');
  });

  it('should trim whitespace around keys', () => {
    const { container } = render(<ShortcutLabel accelerator="Ctrl + C" />);

    const keys = container.querySelectorAll('.ore-shortcut-label__kbd');
    expect(keys).toHaveLength(2);
    expect(keys[0]).toHaveTextContent('Ctrl');
    expect(keys[1]).toHaveTextContent('C');
  });
});

describe('<LevelBar />', () => {
  it('should render the fill width from the value', () => {
    const { container } = render(<LevelBar value={50} />);

    const fill = fillOf(container);
    expect(fill).toHaveClass('ore-level-bar__fill', 'ore-level-bar__fill--normal');
    expect(fill.style.width).toBe('50%');
  });

  it('should use the low class for values at or below 20 percent', () => {
    const { container } = render(<LevelBar value={10} />);

    const fill = fillOf(container);
    expect(fill).toHaveClass('ore-level-bar__fill--low');
    expect(fill.style.width).toBe('10%');
  });

  it('should use the high class for values at or above 80 percent', () => {
    const { container } = render(<LevelBar value={90} />);

    const fill = fillOf(container);
    expect(fill).toHaveClass('ore-level-bar__fill--high');
    expect(fill.style.width).toBe('90%');
  });

  it('should clamp out-of-range values', () => {
    const high = render(<LevelBar value={150} />);
    expect(fillOf(high.container).style.width).toBe('100%');

    const low = render(<LevelBar value={-5} />);
    expect(fillOf(low.container).style.width).toBe('0%');
  });
});

describe('<ProgressBar />', () => {
  it('should render the fill width from the fraction', () => {
    const { container } = render(<ProgressBar fraction={0.4} />);

    expect(container.firstElementChild).toHaveClass('ore-progress-bar');
    expect(fillOf(container).style.width).toBe('40%');
  });

  it('should pulse with a fixed fill width when pulse is set', () => {
    const { container } = render(<ProgressBar pulse />);

    expect(container.firstElementChild).toHaveClass('ore-progress-bar--pulse');
    expect(fillOf(container).style.width).toBe('30%');
  });

  it('should apply the shimmer class', () => {
    const { container } = render(<ProgressBar shimmer />);

    expect(container.firstElementChild).toHaveClass('ore-progress-bar--shimmer');
  });

  it('should render the default percent text when showText is set', () => {
    render(<ProgressBar fraction={0.4} showText />);

    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('should render custom text when provided', () => {
    render(<ProgressBar fraction={0.4} showText text="Uploading" />);

    expect(screen.getByText('Uploading')).toBeInTheDocument();
    expect(screen.queryByText('40%')).not.toBeInTheDocument();
  });

  it('should not render text by default', () => {
    const { container } = render(<ProgressBar fraction={0.4} />);

    expect(container.querySelector('.ore-progress-bar__text')).not.toBeInTheDocument();
  });

  it('should clamp fractions above one', () => {
    const { container } = render(<ProgressBar fraction={1.5} />);

    expect(fillOf(container).style.width).toBe('100%');
  });
});

describe('<FadingLabel />', () => {
  it('should render its children', () => {
    render(<FadingLabel>Networking</FadingLabel>);

    expect(screen.getByText('Networking')).toBeInTheDocument();
  });

  it('should merge the className', () => {
    const { container } = render(<FadingLabel className="custom-fading">Networking</FadingLabel>);

    expect(container.firstElementChild).toHaveClass('ore-fading-label', 'custom-fading');
  });
});

describe('<Badge />', () => {
  it('should render the default variant', () => {
    const { container } = render(<Badge>3</Badge>);

    expect(container.firstElementChild).toHaveClass('ore-badge', 'ore-badge--default');
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render the requested variant class', () => {
    const { container, rerender } = render(<Badge variant="accent">New</Badge>);
    expect(container.firstElementChild).toHaveClass('ore-badge--accent');

    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(container.firstElementChild).toHaveClass('ore-badge--destructive');

    rerender(<Badge variant="success">Done</Badge>);
    expect(container.firstElementChild).toHaveClass('ore-badge--success');
  });
});
