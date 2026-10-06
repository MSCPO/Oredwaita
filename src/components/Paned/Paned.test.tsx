import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { ThemeProvider } from '../ThemeProvider/ThemeProvider';
import { Paned } from './Paned';

const drag = (handle: HTMLElement, from: number, to: number) => {
  fireEvent.pointerDown(handle, { clientX: from, clientY: from, button: 0 });
  fireEvent.pointerMove(window, { clientX: to, clientY: to });
  fireEvent.pointerUp(window);
};

describe('<Paned />', () => {
  it('should render both panes with their children', () => {
    render(<Paned start={<div>Sidebar</div>} end={<div>Content</div>} />);

    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should use the default position for the start pane', () => {
    const { container } = render(<Paned start={<div>Sidebar</div>} end={<div>Content</div>} />);

    expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '200');
    const startPane = container.querySelector<HTMLElement>('.ore-paned__pane--start');
    expect(startPane).toHaveStyle({ flexBasis: '200px' });
  });

  it('should honor defaultPosition for uncontrolled usage', () => {
    render(<Paned defaultPosition={120} start={<div>Sidebar</div>} end={<div>Content</div>} />);

    expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '120');
  });

  it('should keep the controlled position while reporting drags via onPositionChange', () => {
    const onPositionChange = vi.fn();
    render(<Paned position={120} onPositionChange={onPositionChange} />);

    const handle = screen.getByRole('separator');
    drag(handle, 0, 40);

    expect(onPositionChange).toHaveBeenCalledWith(160);
    expect(handle).toHaveAttribute('aria-valuenow', '120');
  });

  it('should resize internally when uncontrolled', () => {
    render(<Paned defaultPosition={100} />);

    const handle = screen.getByRole('separator');
    drag(handle, 0, 40);

    expect(handle).toHaveAttribute('aria-valuenow', '140');
  });

  it('should resize with ArrowLeft/ArrowRight in the horizontal orientation', () => {
    render(<Paned defaultPosition={100} />);

    const handle = screen.getByRole('separator');
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(handle).toHaveAttribute('aria-valuenow', '110');

    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(handle).toHaveAttribute('aria-valuenow', '100');
  });

  it('should resize with ArrowUp/ArrowDown in the vertical orientation', () => {
    render(<Paned orientation="vertical" defaultPosition={100} />);

    const handle = screen.getByRole('separator');
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(handle).toHaveAttribute('aria-valuenow', '110');

    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(handle).toHaveAttribute('aria-valuenow', '100');
  });

  it('should jump to minPosition/maxPosition with Home/End', () => {
    render(<Paned defaultPosition={100} minPosition={40} maxPosition={300} />);

    const handle = screen.getByRole('separator');
    expect(handle).toHaveAttribute('aria-valuemin', '40');
    expect(handle).toHaveAttribute('aria-valuemax', '300');

    fireEvent.keyDown(handle, { key: 'End' });
    expect(handle).toHaveAttribute('aria-valuenow', '300');

    fireEvent.keyDown(handle, { key: 'Home' });
    expect(handle).toHaveAttribute('aria-valuenow', '40');
  });

  it('should clamp the dragged position to minPosition/maxPosition', () => {
    render(<Paned defaultPosition={80} minPosition={50} maxPosition={100} />);

    const handle = screen.getByRole('separator');
    drag(handle, 0, -10000);
    expect(handle).toHaveAttribute('aria-valuenow', '50');

    drag(handle, 0, 10000);
    expect(handle).toHaveAttribute('aria-valuenow', '100');
  });

  it('should expose orientation classes and the perpendicular handle orientation', () => {
    const { rerender, container } = render(<Paned />);

    expect(container.firstElementChild).toHaveClass('ore-paned--horizontal');
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');

    rerender(<Paned orientation="vertical" />);
    expect(container.firstElementChild).toHaveClass('ore-paned--vertical');
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('should label the resize handle from the labels dictionary', () => {
    const { rerender } = render(<Paned />);

    expect(screen.getByRole('separator', { name: 'Resize' })).toBeInTheDocument();

    rerender(
      <ThemeProvider labels={{ resize: '大小调整' }}>
        <Paned />
      </ThemeProvider>,
    );
    expect(screen.getByRole('separator', { name: '大小调整' })).toBeInTheDocument();
  });

  it('should forward extra props, style and className to the root element', () => {
    render(<Paned data-testid="paned" className="extra-class" style={{ color: 'rgb(255, 0, 0)' }} />);

    const root = screen.getByTestId('paned');
    expect(root).toHaveClass('ore-paned', 'extra-class');
    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
