import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HeaderBar, WindowTitle } from './HeaderBar';

describe('<WindowTitle />', () => {
  it('should render title and subtitle', () => {
    render(<WindowTitle title="Files" subtitle="/home/user" />);

    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByText('/home/user')).toBeInTheDocument();
  });

  it('should not render a subtitle container without a subtitle', () => {
    const { container } = render(<WindowTitle title="Files" />);

    expect(container.querySelector('.ore-window-title__subtitle')).not.toBeInTheDocument();
  });
});

describe('<HeaderBar />', () => {
  const user = userEvent.setup();

  it('should render title and subtitle', () => {
    render(<HeaderBar title="Files" subtitle="/home/user" />);

    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByText('/home/user')).toBeInTheDocument();
  });

  it('should render the back button only when requested and call onBackClick', async () => {
    const onBackClick = vi.fn();
    const { rerender } = render(<HeaderBar title="Files" />);

    expect(screen.queryByRole('button', { name: 'Go back' })).not.toBeInTheDocument();

    rerender(<HeaderBar title="Files" showBackButton onBackClick={onBackClick} />);
    await user.click(screen.getByRole('button', { name: 'Go back' }));

    expect(onBackClick).toHaveBeenCalledTimes(1);
  });

  it('should render the default back icon and label', () => {
    render(<HeaderBar title="Files" showBackButton />);

    expect(screen.getByRole('button', { name: 'Go back' })).toHaveTextContent('←');
  });

  it('should allow overriding the back icon and label', () => {
    render(<HeaderBar title="Files" showBackButton backIcon="→" backLabel="Return to files" />);

    expect(screen.getByRole('button', { name: 'Return to files' })).toHaveTextContent('→');
  });

  it('should forward rest props and style to the header element', () => {
    render(
      <HeaderBar
        title="Files"
        id="app-header"
        data-testid="header-bar"
        style={{ color: 'rgb(18, 52, 86)' }}
        aria-describedby="header-hint"
      />,
    );

    const header = screen.getByTestId('header-bar');
    expect(header.tagName).toBe('HEADER');
    expect(header).toHaveAttribute('id', 'app-header');
    expect(header).toHaveAttribute('aria-describedby', 'header-hint');
    expect(header).toHaveStyle({ color: 'rgb(18, 52, 86)' });
  });

  it('should apply the flat variant class', () => {
    const { container } = render(<HeaderBar title="Files" flat />);

    expect(container.firstElementChild).toHaveClass('ore-header-bar', 'ore-header-bar--flat');
  });

  it('should prefer titleWidget over the title', () => {
    render(<HeaderBar title="Files" titleWidget={<div>Custom widget</div>} />);

    expect(screen.getByText('Custom widget')).toBeInTheDocument();
    expect(screen.queryByText('Files')).not.toBeInTheDocument();
  });

  it('should render start and end title buttons', () => {
    render(
      <HeaderBar
        title="Files"
        startTitleButtons={<button type="button">Start</button>}
        endTitleButtons={<button type="button">End</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'End' })).toBeInTheDocument();
  });

  it('should merge the className', () => {
    const { container } = render(<HeaderBar title="Files" className="custom-header" />);

    expect(container.firstElementChild).toHaveClass('ore-header-bar', 'custom-header');
  });
});
