import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PreferencesRow } from '../Rows/Rows';
import { PreferencesDialog, PreferencesGroup, PreferencesPage, PreferencesWindow } from './Preferences';

describe('<PreferencesGroup />', () => {
  it('should render its title, description, header suffix and rows', () => {
    render(
      <PreferencesGroup
        title="Appearance"
        description="Personalise the window"
        headerSuffix={<button type="button">Reset</button>}
      >
        <PreferencesRow title="Dark mode" />
      </PreferencesGroup>,
    );

    expect(screen.getByRole('heading', { name: 'Appearance' })).toHaveClass('ore-preferences-group__title');
    expect(screen.getByText('Personalise the window')).toHaveClass('ore-preferences-group__description');
    expect(screen.getByRole('button', { name: 'Reset' }).parentElement).toHaveClass('ore-preferences-group__suffix');
    expect(screen.getByText('Dark mode')).toHaveClass('ore-preferences-row__title');
  });

  it('should render rows without a header when no header content is given', () => {
    render(
      <PreferencesGroup>
        <PreferencesRow title="Dark mode" />
      </PreferencesGroup>,
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });
});

describe('<PreferencesPage />', () => {
  it('should render its title, description and content', () => {
    render(
      <PreferencesPage id="general" title="General" description="Global settings">
        <PreferencesRow title="Dark mode" />
      </PreferencesPage>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'General' })).toHaveClass('ore-preferences-page__title');
    expect(screen.getByText('Global settings')).toHaveClass('ore-preferences-page__description');
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('should forward rest props and style to the page root', () => {
    render(
      <PreferencesPage id="general" title="General" data-testid="prefs-page" style={{ color: 'rgb(18, 52, 86)' }} />,
    );

    const page = screen.getByTestId('prefs-page');
    expect(page).toHaveClass('ore-preferences-page');
    expect(page).toHaveAttribute('id', 'general');
    expect(page).toHaveStyle({ color: 'rgb(18, 52, 86)' });
  });
});

describe('<PreferencesWindow />', () => {
  const user = userEvent.setup();
  const pages = [
    { id: 'general', title: 'General', children: <PreferencesRow title="Dark mode" /> },
    { id: 'network', title: 'Network', children: <PreferencesRow title="Proxy" /> },
  ];

  it('should show the first page with a sidebar entry per page', () => {
    render(<PreferencesWindow pages={pages} />);

    expect(screen.getByRole('button', { name: 'General' })).toHaveClass('ore-preferences-window__nav-item--active');
    expect(screen.getByRole('button', { name: 'Network' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'General' })).toBeInTheDocument();
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('should switch pages from the sidebar and report the change', async () => {
    const onPageChange = vi.fn();
    render(<PreferencesWindow pages={pages} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: 'Network' }));

    expect(onPageChange).toHaveBeenCalledWith('network');
    expect(screen.getByRole('heading', { level: 2, name: 'Network' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Network' })).toHaveClass('ore-preferences-window__nav-item--active');
    expect(screen.queryByRole('heading', { level: 2, name: 'General' })).not.toBeInTheDocument();
  });

  it('should honour a controlled active page', async () => {
    const onPageChange = vi.fn();
    render(<PreferencesWindow pages={pages} activePageId="network" onPageChange={onPageChange} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Network' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'General' }));

    expect(onPageChange).toHaveBeenCalledWith('general');
    expect(screen.queryByRole('heading', { level: 2, name: 'General' })).not.toBeInTheDocument();
  });

  it('should offer a search field by default and drop it when disabled', async () => {
    const { rerender } = render(<PreferencesWindow pages={pages} />);

    const search = screen.getByPlaceholderText('Search preferences...');
    await user.type(search, 'proxy');
    expect(search).toHaveValue('proxy');

    rerender(<PreferencesWindow pages={pages} searchEnabled={false} />);
    expect(screen.queryByPlaceholderText('Search preferences...')).not.toBeInTheDocument();
  });

  it('should render a close button when onClose is given', async () => {
    const onClose = vi.fn();
    render(<PreferencesWindow pages={pages} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render the default sidebar title', () => {
    render(<PreferencesWindow pages={pages} />);

    expect(screen.getByText('Preferences')).toHaveClass('ore-preferences-window__sidebar-title');
  });

  it('should support a custom sidebar title', () => {
    render(<PreferencesWindow pages={pages} title="Settings" />);

    expect(screen.getByText('Settings')).toHaveClass('ore-preferences-window__sidebar-title');
    expect(screen.queryByText('Preferences')).not.toBeInTheDocument();
  });

  it('should support a custom search placeholder', () => {
    render(<PreferencesWindow pages={pages} searchPlaceholder="Find settings" />);

    expect(screen.getByPlaceholderText('Find settings')).toBeInTheDocument();
  });

  it('should support a custom close icon and label', async () => {
    const onClose = vi.fn();
    render(<PreferencesWindow pages={pages} onClose={onClose} closeIcon="×" closeLabel="Dismiss" />);

    const closeButton = screen.getByRole('button', { name: 'Dismiss' });
    expect(closeButton).toHaveTextContent('×');

    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should forward rest props and style to the window root', () => {
    render(
      <PreferencesWindow
        pages={pages}
        id="prefs-window"
        data-testid="prefs-window-root"
        style={{ color: 'rgb(18, 52, 86)' }}
      />,
    );

    const win = screen.getByTestId('prefs-window-root');
    expect(win).toHaveClass('ore-preferences-window');
    expect(win).toHaveAttribute('id', 'prefs-window');
    expect(win).toHaveStyle({ color: 'rgb(18, 52, 86)' });
  });
});

describe('<PreferencesDialog />', () => {
  const user = userEvent.setup();
  const pages = [
    {
      id: 'general',
      title: 'General',
      children: (
        <PreferencesGroup title="Appearance">
          <PreferencesRow title="Dark mode" />
        </PreferencesGroup>
      ),
    },
    { id: 'network', title: 'Network', children: <PreferencesRow title="Proxy" /> },
  ];

  it('should render the window with groups and rows while open', () => {
    render(<PreferencesDialog open pages={pages} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('heading', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('should render nothing while closed', () => {
    render(<PreferencesDialog open={false} pages={pages} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should call onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<PreferencesDialog open pages={pages} onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when the overlay is clicked', async () => {
    const onClose = vi.fn();
    render(<PreferencesDialog open pages={pages} onClose={onClose} />);

    await user.click(screen.getByRole('presentation'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should stay open when clicking inside the dialog content', async () => {
    const onClose = vi.fn();
    render(<PreferencesDialog open pages={pages} onClose={onClose} />);

    await user.click(screen.getByRole('heading', { name: 'Appearance' }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should close from the window close button', async () => {
    const onClose = vi.fn();
    render(<PreferencesDialog open pages={pages} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should switch pages inside the dialog', async () => {
    render(<PreferencesDialog open pages={pages} onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Network' }));

    expect(screen.getByRole('heading', { level: 2, name: 'Network' })).toBeInTheDocument();
  });
});
