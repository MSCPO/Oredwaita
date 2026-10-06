import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApplicationWindow, Window, WindowControls } from './Window';

describe('<WindowControls />', () => {
  const user = userEvent.setup();

  it('should render close, minimize and maximize buttons with accessible names', () => {
    render(<WindowControls />);

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Minimize' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Maximize' })).toBeInTheDocument();
  });

  it('should fire the matching callback for each control', async () => {
    const onClose = vi.fn();
    const onMinimize = vi.fn();
    const onMaximize = vi.fn();
    render(<WindowControls onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByRole('button', { name: 'Minimize' }));
    await user.click(screen.getByRole('button', { name: 'Maximize' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onMinimize).toHaveBeenCalledTimes(1);
    expect(onMaximize).toHaveBeenCalledTimes(1);
  });

  it('should support custom labels for the controls', () => {
    render(<WindowControls closeLabel="Dismiss" minimizeLabel="Iconify" maximizeLabel="Expand" />);

    expect(screen.getByRole('button', { name: 'Dismiss' })).toHaveAttribute('title', 'Dismiss');
    expect(screen.getByRole('button', { name: 'Iconify' })).toHaveAttribute('title', 'Iconify');
    expect(screen.getByRole('button', { name: 'Expand' })).toHaveAttribute('title', 'Expand');
  });
});

describe('<Window />', () => {
  const user = userEvent.setup();

  it('should render the titlebar, controls and content', () => {
    render(<Window titlebar={<div>Title bar</div>} content={<p>Window body</p>} showControls onClose={vi.fn()} />);

    expect(screen.getByText('Title bar')).toBeInTheDocument();
    expect(screen.getByText('Window body')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('should render children when no content prop is given', () => {
    render(
      <Window>
        <p>Child body</p>
      </Window>,
    );

    expect(screen.getByText('Child body')).toBeInTheDocument();
  });

  it('should not render a titlebar without titlebar content or controls', () => {
    const { container } = render(<Window content={<p>Window body</p>} />);

    expect(container.querySelector('.ore-window__titlebar')).not.toBeInTheDocument();
  });

  it('should apply the resizable class and inline dimensions', () => {
    const { container } = render(
      <Window resizable defaultWidth={640} defaultHeight="50%" content={<p>Window body</p>} />,
    );

    const win = container.firstElementChild as HTMLElement;
    expect(win).toHaveClass('ore-window', 'ore-window--resizable');
    expect(win.style.width).toBe('640px');
    expect(win.style.height).toBe('50%');
  });

  it('should close via the titlebar control', async () => {
    const onClose = vi.fn();
    render(<Window titlebar="Title" showControls onClose={onClose} content={<p>Window body</p>} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should merge the className', () => {
    const { container } = render(<Window className="custom-window" content={<p>Window body</p>} />);

    expect(container.firstElementChild).toHaveClass('ore-window', 'custom-window');
  });

  it('should forward rest props and style to the window root', () => {
    const { container } = render(
      <Window
        content={<p>Window body</p>}
        id="main-window"
        data-testid="window-root"
        style={{ color: 'rgb(18, 52, 86)' }}
      />,
    );

    const win = screen.getByTestId('window-root');
    expect(win).toBe(container.firstElementChild);
    expect(win).toHaveAttribute('id', 'main-window');
    expect(win).toHaveStyle({ color: 'rgb(18, 52, 86)' });
  });
});

describe('<ApplicationWindow />', () => {
  const user = userEvent.setup();

  it('should render the header title, subtitle and window controls', () => {
    render(<ApplicationWindow title="Files" subtitle="/home/user" content={<p>Window body</p>} />);

    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByText('/home/user')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('should fire onClose from the header controls', async () => {
    const onClose = vi.fn();
    render(<ApplicationWindow title="Files" content={<p>Window body</p>} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render the status page instead of content when enabled', () => {
    render(
      <ApplicationWindow
        title="Files"
        showStatusPage
        statusPageProps={{ title: 'No files', description: 'Nothing here' }}
        content={<p>Window body</p>}
      />,
    );

    expect(screen.getByText('No files')).toBeInTheDocument();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.queryByText('Window body')).not.toBeInTheDocument();
  });
});
