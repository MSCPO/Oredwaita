import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Sidebar, SidebarItem, SidebarSection } from './Sidebar';

describe('<Sidebar />', () => {
  it('should render title, header, body and footer', () => {
    render(
      <Sidebar title="Files" header={<span>Header widget</span>} footer={<span>Footer widget</span>}>
        <SidebarItem title="Documents" />
      </Sidebar>,
    );

    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByText('Header widget')).toBeInTheDocument();
    expect(screen.getByText('Footer widget')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Documents' })).toBeInTheDocument();
  });

  it('should apply the collapsed class when collapsed', () => {
    const { container } = render(<Sidebar collapsed>Content</Sidebar>);

    expect(container.firstElementChild).toHaveClass('ore-sidebar', 'ore-sidebar--collapsed');
  });

  it('should not render header or footer areas without their content', () => {
    const { container } = render(<Sidebar>Content</Sidebar>);

    expect(container.querySelector('.ore-sidebar__header')).not.toBeInTheDocument();
    expect(container.querySelector('.ore-sidebar__footer')).not.toBeInTheDocument();
  });

  it('should merge the className', () => {
    const { container } = render(<Sidebar className="custom-sidebar">Content</Sidebar>);

    expect(container.firstElementChild).toHaveClass('ore-sidebar', 'custom-sidebar');
  });
});

describe('<SidebarItem />', () => {
  const user = userEvent.setup();

  it('should render the title with icon, badge and suffix', () => {
    render(<SidebarItem title="Inbox" icon={<span data-testid="icon" />} badge="5" suffix={<span>»</span>} />);

    expect(screen.getByRole('button', { name: /Inbox/ })).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('»')).toBeInTheDocument();
  });

  it('should mark the selected item', () => {
    render(<SidebarItem title="Inbox" selected />);

    expect(screen.getByRole('button', { name: /Inbox/ })).toHaveClass('ore-sidebar-item--selected');
  });

  it('should call onSelect when clicked', async () => {
    const onSelect = vi.fn();
    render(<SidebarItem title="Inbox" onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: /Inbox/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should forward onClick with the event', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();
    render(<SidebarItem title="Inbox" onSelect={onSelect} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: /Inbox/ }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(expect.anything());
  });

  it('should not call onSelect when disabled', async () => {
    const onSelect = vi.fn();
    render(<SidebarItem title="Inbox" onSelect={onSelect} disabled />);

    const item = screen.getByRole('button', { name: /Inbox/ });
    expect(item).toBeDisabled();

    await user.click(item);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should merge the className', () => {
    render(<SidebarItem title="Inbox" className="custom-item" />);

    expect(screen.getByRole('button', { name: /Inbox/ })).toHaveClass('ore-sidebar-item', 'custom-item');
  });
});

describe('<SidebarSection />', () => {
  it('should render the header title, action and items', () => {
    render(
      <SidebarSection title="Devices" action={<button type="button">Add</button>}>
        <SidebarItem title="Phone" />
      </SidebarSection>,
    );

    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Phone' })).toBeInTheDocument();
  });

  it('should not render a header without title or action', () => {
    const { container } = render(
      <SidebarSection>
        <SidebarItem title="Phone" />
      </SidebarSection>,
    );

    expect(container.querySelector('.ore-sidebar-section__header')).not.toBeInTheDocument();
    expect(container.querySelector('.ore-sidebar-section__items')).toBeInTheDocument();
  });

  it('should merge the className', () => {
    const { container } = render(<SidebarSection className="custom-section">Content</SidebarSection>);

    expect(container.firstElementChild).toHaveClass('ore-sidebar-section', 'custom-section');
  });
});
