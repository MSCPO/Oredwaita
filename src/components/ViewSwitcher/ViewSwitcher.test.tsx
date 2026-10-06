import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InlineViewSwitcher, ViewStack, ViewSwitcher, ViewSwitcherBar, ViewSwitcherSidebar } from './ViewSwitcher';

const pages = [
  { id: 'music', title: 'Music' },
  { id: 'movies', title: 'Movies', badge: '3' },
];

describe('<ViewSwitcher />', () => {
  const user = userEvent.setup();

  it('should render a navigation with a button per page', () => {
    render(<ViewSwitcher pages={pages} activePage="music" onPageChange={vi.fn()} />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Music' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Movies/ })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should mark the active page', () => {
    render(<ViewSwitcher pages={pages} activePage="movies" onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Movies/ })).toHaveClass('ore-view-switcher__btn--active');
    expect(screen.getByRole('button', { name: 'Music' })).not.toHaveClass('ore-view-switcher__btn--active');
  });

  it('should call onPageChange with the clicked page id', async () => {
    const onPageChange = vi.fn();
    render(<ViewSwitcher pages={pages} activePage="music" onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: /Movies/ }));
    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith('movies');
  });

  it('should apply the policy class', () => {
    render(<ViewSwitcher pages={pages} activePage="music" onPageChange={vi.fn()} policy="narrow" />);

    expect(screen.getByRole('navigation')).toHaveClass('ore-view-switcher', 'ore-view-switcher--narrow');
  });

  it('should merge the className', () => {
    render(<ViewSwitcher pages={pages} activePage="music" onPageChange={vi.fn()} className="custom-switcher" />);

    expect(screen.getByRole('navigation')).toHaveClass('ore-view-switcher', 'custom-switcher');
  });
});

describe('<InlineViewSwitcher />', () => {
  it('should add the inline class', () => {
    render(<InlineViewSwitcher pages={pages} activePage="music" onPageChange={vi.fn()} />);

    expect(screen.getByRole('navigation')).toHaveClass('ore-view-switcher', 'ore-view-switcher--inline');
  });
});

describe('<ViewSwitcherBar />', () => {
  it('should render the switcher with the wide policy inside a bar', () => {
    render(<ViewSwitcherBar pages={pages} activePage="music" onPageChange={vi.fn()} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('ore-view-switcher--wide');
    expect(nav.parentElement).toHaveClass('ore-view-switcher-bar');
  });

  it('should render nothing when reveal is false', () => {
    const { container } = render(
      <ViewSwitcherBar pages={pages} activePage="music" onPageChange={vi.fn()} reveal={false} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe('<ViewSwitcherSidebar />', () => {
  const user = userEvent.setup();

  it('should render sidebar items with the active one selected', () => {
    render(<ViewSwitcherSidebar pages={pages} activePage="movies" onPageChange={vi.fn()} title="Library" />);

    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Movies/ })).toHaveClass('ore-sidebar-item--selected');
    expect(screen.getByRole('button', { name: /Music/ })).not.toHaveClass('ore-sidebar-item--selected');
  });

  it('should call onPageChange when an item is clicked', async () => {
    const onPageChange = vi.fn();
    render(<ViewSwitcherSidebar pages={pages} activePage="music" onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: /Movies/ }));
    expect(onPageChange).toHaveBeenCalledWith('movies');
  });
});

describe('<ViewStack />', () => {
  it('should render only the view matching activePage', () => {
    render(
      <ViewStack activePage="movies">
        <div id="music">Music view</div>
        <div id="movies">Movies view</div>
      </ViewStack>,
    );

    expect(screen.queryByText('Music view')).not.toBeInTheDocument();
    expect(screen.getByText('Movies view')).toBeInTheDocument();
  });

  it('should merge the className', () => {
    const { container } = render(
      <ViewStack activePage="movies" className="custom-stack">
        <div id="movies">Movies view</div>
      </ViewStack>,
    );

    expect(container.firstElementChild).toHaveClass('ore-view-stack', 'custom-stack');
  });
});
