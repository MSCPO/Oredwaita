import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NavigationView, OverlaySplitView } from '../Navigation';

describe('<OverlaySplitView />', () => {
  it('should render an aria-hidden backdrop while the sidebar is visible', () => {
    render(<OverlaySplitView sidebarVisible onSidebarVisibleChange={vi.fn()} sidebar="Sidebar" content="Content" />);

    const backdrop = document.querySelector('.ore-overlay-split-view__backdrop');
    expect(backdrop).not.toBeNull();
    expect(backdrop).toHaveAttribute('aria-hidden', 'true');
  });

  it('should not render a backdrop when the sidebar is hidden', () => {
    render(<OverlaySplitView sidebar="Sidebar" content="Content" />);

    expect(document.querySelector('.ore-overlay-split-view__backdrop')).toBeNull();
  });

  it('should close the sidebar on Escape', () => {
    const onSidebarVisibleChange = vi.fn();
    render(
      <OverlaySplitView
        sidebarVisible
        onSidebarVisibleChange={onSidebarVisibleChange}
        sidebar="Sidebar"
        content="Content"
      />,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onSidebarVisibleChange).toHaveBeenCalledTimes(1);
    expect(onSidebarVisibleChange).toHaveBeenCalledWith(false);
  });

  it('should close the sidebar when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onSidebarVisibleChange = vi.fn();
    render(
      <OverlaySplitView
        sidebarVisible
        onSidebarVisibleChange={onSidebarVisibleChange}
        sidebar="Sidebar"
        content="Content"
      />,
    );

    const backdrop = document.querySelector('.ore-overlay-split-view__backdrop');
    expect(backdrop).not.toBeNull();
    await user.click(backdrop as HTMLElement);
    expect(onSidebarVisibleChange).toHaveBeenCalledWith(false);
  });

  it('should not steal focus from outside content when opened (non-modal)', () => {
    const ui = (sidebarVisible: boolean) => (
      <>
        <button type="button">Anchor</button>
        <OverlaySplitView
          sidebarVisible={sidebarVisible}
          onSidebarVisibleChange={vi.fn()}
          sidebar="Sidebar"
          content="Content"
        />
      </>
    );
    const { rerender } = render(ui(false));
    const anchor = screen.getByRole('button', { name: 'Anchor' });
    anchor.focus();

    rerender(ui(true));
    expect(anchor).toHaveFocus();
  });
});

describe('<NavigationView />', () => {
  it('should render the active page content', () => {
    render(
      <NavigationView initialPageId="home" pages={[{ id: 'home', title: 'Home', content: <p>Home content</p> }]} />,
    );

    expect(screen.getByText('Home content')).toBeInTheDocument();
  });

  it('should push and pop pages through the content helpers', async () => {
    const user = userEvent.setup();
    render(
      <NavigationView
        initialPageId="home"
        pages={[
          {
            id: 'home',
            title: 'Home',
            content: ({ pushPage }) => (
              <button type="button" onClick={() => pushPage('detail')}>
                Open detail
              </button>
            ),
          },
          {
            id: 'detail',
            title: 'Detail',
            content: ({ popPage, canPop }) => (
              <button type="button" onClick={popPage}>
                {canPop ? 'Back to home' : 'Root page'}
              </button>
            ),
          },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Open detail' }));
    expect(screen.getByRole('button', { name: 'Back to home' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to home' }));
    expect(screen.getByRole('button', { name: 'Open detail' })).toBeInTheDocument();
  });
});
