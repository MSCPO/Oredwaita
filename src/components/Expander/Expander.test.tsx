import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Expander } from './Expander';

describe('<Expander />', () => {
  const user = userEvent.setup();

  it('should render collapsed by default without the region', () => {
    render(
      <Expander title="Advanced Options">
        <p>Hidden content</p>
      </Expander>,
    );

    const header = screen.getByRole('button', { name: 'Advanced Options' });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('should render expanded when defaultExpanded is set', () => {
    render(
      <Expander title="Advanced Options" defaultExpanded>
        <p>Visible content</p>
      </Expander>,
    );

    expect(screen.getByRole('region')).toHaveTextContent('Visible content');
    expect(screen.getByRole('button', { name: 'Advanced Options' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('should toggle on header click and report the boolean state', async () => {
    const onExpandedChange = vi.fn();
    render(
      <Expander title="Advanced Options" onExpandedChange={onExpandedChange}>
        <p>Content</p>
      </Expander>,
    );

    const header = screen.getByRole('button', { name: 'Advanced Options' });
    await user.click(header);
    expect(onExpandedChange).toHaveBeenLastCalledWith(true);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region')).toBeInTheDocument();

    await user.click(header);
    expect(onExpandedChange).toHaveBeenLastCalledWith(false);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('should keep the controlled expanded state regardless of clicks', async () => {
    const onExpandedChange = vi.fn();
    const { rerender } = render(
      <Expander title="Advanced Options" expanded={false} onExpandedChange={onExpandedChange}>
        <p>Content</p>
      </Expander>,
    );

    await user.click(screen.getByRole('button', { name: 'Advanced Options' }));
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();

    rerender(
      <Expander title="Advanced Options" expanded onExpandedChange={onExpandedChange}>
        <p>Content</p>
      </Expander>,
    );
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('should prefer the controlled expanded over defaultExpanded', () => {
    render(
      <Expander title="Advanced Options" expanded={false} defaultExpanded>
        <p>Content</p>
      </Expander>,
    );

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Advanced Options' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('should associate the header button with the region', () => {
    render(
      <Expander title="Details" defaultExpanded>
        <p>Content</p>
      </Expander>,
    );

    const header = screen.getByRole('button', { name: 'Details' });
    const region = screen.getByRole('region');
    expect(header.id).not.toBe('');
    expect(header).toHaveAttribute('aria-controls', region.id);
    expect(region).toHaveAttribute('aria-labelledby', header.id);
  });

  it('should render an optional leading icon', () => {
    render(
      <Expander title="Network" icon={<span data-testid="expander-icon">Plug</span>}>
        <p>Content</p>
      </Expander>,
    );

    expect(screen.getByTestId('expander-icon')).toBeInTheDocument();
  });

  it('should rotate the chevron when expanded', async () => {
    render(
      <Expander title="Details">
        <p>Content</p>
      </Expander>,
    );

    const header = screen.getByRole('button', { name: 'Details' });
    const chevron = header.querySelector('.ore-expander__chevron');
    expect(chevron).not.toHaveClass('ore-expander__chevron--open');

    await user.click(header);
    expect(chevron).toHaveClass('ore-expander__chevron--open');
  });

  it('should mark the chevron as decorative', () => {
    render(
      <Expander title="Details">
        <p>Content</p>
      </Expander>,
    );

    const chevron = screen.getByRole('button', { name: 'Details' }).querySelector('.ore-expander__chevron');
    expect(chevron).toHaveAttribute('aria-hidden', 'true');
  });

  it('should merge className and forward rest props and style to the root', () => {
    render(
      <Expander title="Details" className="extra" data-testid="expander" style={{ color: 'rgb(255, 0, 0)' }}>
        <p>Content</p>
      </Expander>,
    );

    const root = screen.getByTestId('expander');
    expect(root).toHaveClass('ore-expander', 'extra');
    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
