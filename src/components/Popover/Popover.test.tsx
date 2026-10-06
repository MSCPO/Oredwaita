import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MenuButton, Popover, PopoverMenuItem, PopoverMenuSection } from '../Popover';

describe('<Popover />', () => {
  it('should close on Escape', () => {
    const onClose = vi.fn();
    render(
      <Popover open onClose={onClose}>
        Menu
      </Popover>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not steal focus when opened (non-modal)', () => {
    render(
      <>
        <button type="button">Anchor</button>
        <Popover open onClose={vi.fn()}>
          Menu
        </Popover>
      </>,
    );
    const anchor = screen.getByRole('button', { name: 'Anchor' });
    anchor.focus();

    expect(anchor).toHaveFocus();
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });
});

describe('<MenuButton />', () => {
  const user = userEvent.setup();

  const renderMenu = () =>
    render(
      <MenuButton label="Actions">
        <PopoverMenuItem label="New Document" />
        <PopoverMenuItem label="Open File" />
        <PopoverMenuItem label="Delete" />
      </MenuButton>,
    );

  it('should render the trigger with menu semantics and reflect the open state', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: /Actions/ });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('should not open the menu when ArrowDown is pressed on the closed trigger', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: /Actions/ });
    trigger.focus();

    await user.keyboard('{ArrowDown}');

    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should move focus through menu items with ArrowDown and wrap with ArrowUp', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: /Actions/ });

    await user.click(trigger);
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'New Document' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Open File' })).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'New Document' })).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
  });

  it('should jump to the first and last menu item with Home and End', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: /Actions/ });

    await user.click(trigger);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('menuitem', { name: 'New Document' })).toHaveFocus();
  });

  it('should render items with menuitem semantics', async () => {
    renderMenu();

    await user.click(screen.getByRole('button', { name: /Actions/ }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Open File' })).toBeInTheDocument();
  });

  it('should pass rest props to the trigger button', () => {
    render(
      <MenuButton label="Actions" data-testid="menu-trigger" aria-label="Open actions">
        <PopoverMenuItem label="New Document" />
      </MenuButton>,
    );

    const trigger = screen.getByRole('button', { name: 'Open actions' });
    expect(trigger).toHaveAttribute('data-testid', 'menu-trigger');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger.querySelector('.ore-menu-button__icon')).toBeInTheDocument();
  });
});

describe('<PopoverMenuItem />', () => {
  it('should merge className and pass through rest props', () => {
    render(<PopoverMenuItem label="New Document" className="extra-item" data-testid="item-new" />);

    const item = screen.getByTestId('item-new');
    expect(item).toHaveClass('ore-popover-menu-item', 'extra-item');
    expect(item).toHaveAttribute('role', 'menuitem');
    expect(item).toHaveTextContent('New Document');
  });
});

describe('<PopoverMenuSection />', () => {
  it('should merge className and pass through rest props', () => {
    render(
      <PopoverMenuSection title="File" className="extra-section" data-testid="section-file">
        <PopoverMenuItem label="New Document" />
      </PopoverMenuSection>,
    );

    const section = screen.getByTestId('section-file');
    expect(section).toHaveClass('ore-popover-menu-section', 'extra-section');
    expect(screen.getByText('File')).toHaveClass('ore-popover-menu-section__title');
  });
});
