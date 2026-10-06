import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TabBar, TabOverview, TabView } from '../Tabs';

describe('<TabBar />', () => {
  const user = userEvent.setup();
  const tabs = [
    { id: '1', title: 'Tab 1' },
    { id: '2', title: 'Tab 2' },
  ];

  it('should render all tabs', () => {
    render(<TabBar tabs={tabs} activeTabId="1" onTabChange={vi.fn()} />);

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });

  it('should trigger onTabChange when tab is clicked', async () => {
    const onTabChange = vi.fn();
    render(<TabBar tabs={tabs} activeTabId="1" onTabChange={onTabChange} />);

    await user.click(screen.getByText('Tab 2'));
    expect(onTabChange).toHaveBeenCalledWith('2');
  });

  it('should render a tablist with roving tabindex', () => {
    render(<TabBar tabs={tabs} activeTabId="1" onTabChange={vi.fn()} />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    const active = screen.getByRole('tab', { selected: true });
    expect(active).toHaveTextContent('Tab 1');
    expect(active).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { selected: false })).toHaveAttribute('tabindex', '-1');
  });

  it('should move selection and focus with arrow keys', () => {
    const onTabChange = vi.fn();
    render(<TabBar tabs={tabs} activeTabId="1" onTabChange={onTabChange} />);

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(onTabChange).toHaveBeenCalledWith('2');
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus();
  });

  it('should activate the first tab and switch on click when uncontrolled', async () => {
    render(<TabBar tabs={tabs} />);

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Tab 1');

    await user.click(screen.getByText('Tab 2'));
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Tab 2');
  });

  it('should honor defaultActiveTabId and report changes when uncontrolled', async () => {
    const onTabChange = vi.fn();
    render(<TabBar tabs={tabs} defaultActiveTabId="2" onTabChange={onTabChange} />);

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Tab 2');

    await user.click(screen.getByText('Tab 1'));
    expect(onTabChange).toHaveBeenCalledWith('1');
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Tab 1');
  });

  it('should switch the internal selection with keyboard when uncontrolled', () => {
    const onTabChange = vi.fn();
    render(<TabBar tabs={tabs} onTabChange={onTabChange} />);

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');
    expect(onTabChange).toHaveBeenLastCalledWith('1');
  });

  it('should render custom close and new-tab icons and labels', () => {
    render(
      <TabBar
        tabs={tabs}
        activeTabId="1"
        onTabChange={vi.fn()}
        onTabClose={vi.fn()}
        onNewTab={vi.fn()}
        closeIcon={<span>X</span>}
        closeTabLabel="Remove tab"
        newTabIcon={<span>＋</span>}
        newTabLabel="Add tab"
      />,
    );

    const closeButtons = screen.getAllByRole('button', { name: 'Remove tab' });
    expect(closeButtons).toHaveLength(2);
    closeButtons.forEach((button) => expect(button).toHaveTextContent('X'));
    expect(screen.getByRole('button', { name: 'Add tab' })).toHaveTextContent('＋');
  });

  it('should pass through rest props and style to the root element', () => {
    render(<TabBar tabs={tabs} activeTabId="1" onTabChange={vi.fn()} data-testid="tab-bar" style={{ padding: 8 }} />);

    const bar = screen.getByTestId('tab-bar');
    expect(bar).toHaveClass('ore-tab-bar');
    expect(bar).toHaveStyle({ padding: '8px' });
  });
});

describe('<TabView />', () => {
  it('should render only the active panel with tabpanel semantics', () => {
    render(
      <TabView activeTabId="2">
        <div id="1">Panel 1</div>
        <div id="2">Panel 2</div>
      </TabView>,
    );

    expect(screen.queryByText('Panel 1')).not.toBeInTheDocument();
    const panel = screen.getByText('Panel 2').closest('[role="tabpanel"]');
    expect(panel).toHaveAttribute('id', 'ore-tab-panel-2');
    expect(panel).toHaveAttribute('aria-labelledby', 'ore-tab-2');
  });

  it('should apply the panel class to the rendered panel', () => {
    render(
      <TabView activeTabId="1">
        <div id="1">Panel 1</div>
      </TabView>,
    );

    expect(screen.getByRole('tabpanel')).toHaveClass('ore-tab-view__panel');
  });

  it('should render no panel when no child matches the active tab', () => {
    render(
      <TabView activeTabId="missing">
        <div id="1">Panel 1</div>
        <div id="2">Panel 2</div>
      </TabView>,
    );

    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
  });

  it('should skip children that are not valid elements', () => {
    render(
      <TabView activeTabId="1">
        plain text
        <div id="1">Panel 1</div>
      </TabView>,
    );

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel 1');
  });

  it('should apply a custom className to the view', () => {
    render(
      <TabView activeTabId="1" className="extra-view">
        <div id="1">Panel 1</div>
      </TabView>,
    );

    expect(screen.getByRole('tabpanel').parentElement).toHaveClass('ore-tab-view', 'extra-view');
  });
});

describe('<TabOverview />', () => {
  const user = userEvent.setup();
  const tabs = [
    { id: '1', title: 'Tab 1' },
    { id: '2', title: 'Tab 2' },
  ];

  it('should render a labelled overview dialog with a thumbnail per tab', () => {
    render(<TabOverview open tabs={tabs} activeTabId="1" onSelectTab={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Tabs Overview' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tab 1' })).toHaveClass('ore-tab-thumbnail--active');
    expect(screen.getByRole('button', { name: 'Tab 2' })).not.toHaveClass('ore-tab-thumbnail--active');
  });

  it('should render nothing when closed', () => {
    render(<TabOverview open={false} tabs={tabs} activeTabId="1" onSelectTab={vi.fn()} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should select the tab and close when a thumbnail is activated', async () => {
    const onSelectTab = vi.fn();
    const onClose = vi.fn();
    render(<TabOverview open tabs={tabs} activeTabId="1" onSelectTab={onSelectTab} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Tab 2' }));

    expect(onSelectTab).toHaveBeenCalledWith('2');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close from the header button', async () => {
    const onClose = vi.fn();
    render(<TabOverview open tabs={tabs} activeTabId="1" onSelectTab={vi.fn()} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close overview' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close on Escape', () => {
    const onClose = vi.fn();
    render(<TabOverview open tabs={tabs} activeTabId="1" onSelectTab={vi.fn()} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close a single tab without selecting it or closing the overview', async () => {
    const onSelectTab = vi.fn();
    const onClose = vi.fn();
    const onCloseTab = vi.fn();
    render(
      <TabOverview
        open
        tabs={tabs}
        activeTabId="1"
        onSelectTab={onSelectTab}
        onCloseTab={onCloseTab}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Close tab Tab 2' }));

    expect(onCloseTab).toHaveBeenCalledWith('2');
    expect(onSelectTab).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should support a custom title, className and close icon', () => {
    render(
      <TabOverview
        open
        tabs={tabs}
        activeTabId="1"
        onSelectTab={vi.fn()}
        onClose={vi.fn()}
        title="Open tabs"
        className="extra-overview"
        closeIcon={<span>X</span>}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Open tabs' });
    expect(dialog).toHaveClass('ore-tab-overview-overlay', 'extra-overview');
    expect(screen.getByText('Open tabs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close overview' })).toHaveTextContent('X');
  });

  it('should build thumbnail close labels with the closeTabLabel function', async () => {
    const onCloseTab = vi.fn();
    render(
      <TabOverview
        open
        tabs={tabs}
        activeTabId="1"
        onSelectTab={vi.fn()}
        onCloseTab={onCloseTab}
        onClose={vi.fn()}
        closeTabLabel={(tabTitle) => `Remove ${tabTitle}`}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Remove Tab 2' }));
    expect(onCloseTab).toHaveBeenCalledWith('2');
  });
});
