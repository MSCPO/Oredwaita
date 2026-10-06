import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Separator } from '../Separator';

describe('<Separator />', () => {
  it('should render a horizontal separator by default', () => {
    render(<Separator />);

    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('ore-separator');
    expect(separator).not.toHaveClass('ore-separator--vertical');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('should apply the vertical modifier class when orientation is vertical', () => {
    render(<Separator orientation="vertical" />);

    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('ore-separator');
    expect(separator).toHaveClass('ore-separator--vertical');
  });

  it('should expose role separator and reflect aria-orientation changes', () => {
    const { rerender } = render(<Separator />);

    const separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('role', 'separator');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');

    rerender(<Separator orientation="vertical" />);
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('should merge a custom className with the block class', () => {
    render(<Separator className="my-divider" />);

    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('ore-separator');
    expect(separator).toHaveClass('my-divider');
  });

  it('should forward extra props to the root element', () => {
    render(<Separator data-testid="target-separator" data-section="header" />);

    const separator = screen.getByTestId('target-separator');
    expect(separator).toHaveAttribute('data-section', 'header');
  });

  it('should forward style to the root element', () => {
    render(<Separator data-testid="styled-separator" style={{ color: 'rgb(255, 0, 0)' }} />);

    expect(screen.getByTestId('styled-separator')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
