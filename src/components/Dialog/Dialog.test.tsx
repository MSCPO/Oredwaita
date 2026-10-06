import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { AboutDialog, Dialog, MessageDialog, ShortcutsDialog } from '../Dialog';

describe('<Dialog />', () => {
  it('should render a modal dialog labelled by its title', () => {
    render(
      <Dialog open onClose={vi.fn()} title="Settings">
        <p>Body</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Settings' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should close on Escape', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose}>
        Body
      </Dialog>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should restore focus to the trigger after closing', () => {
    const onClose = vi.fn();
    const ui = (open: boolean) => (
      <>
        <button type="button">Trigger</button>
        <Dialog open={open} onClose={onClose}>
          Body
        </Dialog>
      </>
    );
    const { rerender } = render(ui(false));
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    trigger.focus();

    rerender(ui(true));
    expect(screen.getByRole('dialog')).toHaveFocus();

    rerender(ui(false));
    expect(trigger).toHaveFocus();
  });

  it('should render a custom close icon while keeping the default close label', () => {
    render(
      <Dialog open onClose={vi.fn()} title="Settings" closeIcon={<span data-testid="close-icon" />}>
        Body
      </Dialog>,
    );

    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('should use closeLabel as the close button accessible name', () => {
    render(
      <Dialog open onClose={vi.fn()} title="Settings" closeLabel="Fermer">
        Body
      </Dialog>,
    );

    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('should forward rest props and style to the dialog container, not the overlay', () => {
    render(
      <Dialog
        open
        onClose={vi.fn()}
        title="Settings"
        data-testid="my-dialog"
        style={{ backgroundColor: 'rgb(1, 2, 3)' }}
      >
        Body
      </Dialog>,
    );

    const dialog = screen.getByTestId('my-dialog');
    expect(dialog).toHaveClass('ore-dialog');
    expect(dialog).toHaveStyle({ backgroundColor: 'rgb(1, 2, 3)' });

    const overlay = dialog.parentElement;
    expect(overlay).toHaveClass('ore-dialog-overlay');
    expect(overlay).not.toHaveAttribute('data-testid', 'my-dialog');
  });

  it('should keep internal role, aria-modal and aria-labelledby when rest props would override them', () => {
    const restOverrides = {
      role: 'region',
      'aria-modal': false,
      'aria-labelledby': 'external',
    } as const;

    render(
      <Dialog open onClose={vi.fn()} title="Settings" {...restOverrides}>
        Body
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Settings' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).not.toHaveAttribute('aria-labelledby', 'external');
  });
});

describe('<MessageDialog />', () => {
  it('should label itself with its heading', () => {
    render(
      <MessageDialog
        open
        onClose={vi.fn()}
        heading="Delete file?"
        responses={[{ id: 'cancel', label: 'Cancel' }]}
        onResponse={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Delete file?' })).toBeInTheDocument();
  });

  it('should forward rest props to the dialog container and keep aria-modal', () => {
    render(
      <MessageDialog
        open
        onClose={vi.fn()}
        heading="Delete file?"
        responses={[{ id: 'cancel', label: 'Cancel' }]}
        onResponse={vi.fn()}
        data-testid="msg-dialog"
        aria-modal="false"
      />,
    );

    const dialog = screen.getByTestId('msg-dialog');
    expect(dialog).toHaveClass('ore-message-dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('dialog', { name: 'Delete file?' })).toBe(dialog);

    const overlay = dialog.parentElement;
    expect(overlay).toHaveClass('ore-dialog-overlay');
    expect(overlay).not.toHaveAttribute('data-testid', 'msg-dialog');
  });
});

describe('<AboutDialog />', () => {
  const baseProps = {
    open: true,
    onClose: vi.fn(),
    applicationName: 'OreDwaita',
    website: 'https://example.com',
  };

  it('should keep the default website label and developer line', () => {
    render(<AboutDialog {...baseProps} developerName="Kai Hotz" />);

    expect(screen.getByRole('link', { name: 'Website' })).toHaveAttribute('href', 'https://example.com');
    expect(screen.getByText('Developed by Kai Hotz')).toBeInTheDocument();
  });

  it('should render a custom website label', () => {
    render(<AboutDialog {...baseProps} websiteLabel="Project homepage" />);

    expect(screen.getByRole('link', { name: 'Project homepage' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Website' })).not.toBeInTheDocument();
  });

  it('should replace the developer line when developerLine is provided', () => {
    render(<AboutDialog {...baseProps} developerName="Kai Hotz" developerLine="Built by the OreDwaita team" />);

    expect(screen.getByText('Built by the OreDwaita team')).toBeInTheDocument();
    expect(screen.queryByText(/Developed by/)).not.toBeInTheDocument();
  });

  it('should merge a custom className onto the internal dialog', () => {
    render(<AboutDialog {...baseProps} className="my-about" />);

    expect(screen.getByRole('dialog')).toHaveClass('ore-about-dialog', 'my-about');
  });
});

describe('<ShortcutsDialog />', () => {
  const sections = [
    {
      title: 'Navigation',
      shortcuts: [{ title: 'Open Settings', accelerator: 'Ctrl + Comma' }],
    },
  ];

  it('should render the default title and the shortcut sections', () => {
    render(<ShortcutsDialog open onClose={vi.fn()} sections={sections} />);

    expect(screen.getByRole('dialog', { name: 'Keyboard Shortcuts' })).toBeInTheDocument();
    expect(screen.getByText('Open Settings')).toBeInTheDocument();
    expect(screen.getByText('Ctrl + Comma')).toBeInTheDocument();
  });

  it('should allow overriding the title', () => {
    render(<ShortcutsDialog open onClose={vi.fn()} sections={sections} title="Help" />);

    expect(screen.getByRole('dialog', { name: 'Help' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Keyboard Shortcuts' })).not.toBeInTheDocument();
  });

  it('should merge className and forward close props to the internal dialog', () => {
    render(
      <ShortcutsDialog
        open
        onClose={vi.fn()}
        sections={sections}
        className="my-shortcuts"
        closeLabel="Dismiss"
        closeIcon={<span data-testid="shortcuts-close-icon" />}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Keyboard Shortcuts' });
    expect(dialog).toHaveClass('ore-shortcuts-dialog', 'my-shortcuts');
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    expect(screen.getByTestId('shortcuts-close-icon')).toBeInTheDocument();
  });
});
