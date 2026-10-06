import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DropDown, type DropDownItem } from './DropDown';

const items: DropDownItem[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
];

describe('<DropDown />', () => {
  const user = userEvent.setup();

  it('should open and close the listbox via the trigger and reflect aria-expanded', async () => {
    render(<DropDown items={items} />);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should call onChange with the value and close when an option is clicked', async () => {
    const onChange = vi.fn();
    render(<DropDown items={items} onChange={onChange} placeholder="Pick one" />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('option', { name: 'Banana' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Banana');
  });

  it('should move the highlight with arrow keys and select with Enter', async () => {
    const onChange = vi.fn();
    render(<DropDown items={items} onChange={onChange} />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveClass('ore-drop-down__option--highlighted');

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveClass('ore-drop-down__option--highlighted');

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should display the controlled value', () => {
    const onChange = vi.fn();
    const { rerender } = render(<DropDown items={items} value="banana" onChange={onChange} />);

    expect(screen.getByRole('button')).toHaveTextContent('Banana');

    rerender(<DropDown items={items} value="date" onChange={onChange} />);
    expect(screen.getByRole('button')).toHaveTextContent('Date');
  });

  it('should select the defaultValue initially when uncontrolled', () => {
    render(<DropDown items={items} defaultValue="banana" />);

    expect(screen.getByRole('button')).toHaveTextContent('Banana');
  });

  it('should fall back to the placeholder state for an unmatched value', () => {
    render(<DropDown items={items} value="mango" placeholder="Choose a fruit" />);

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveTextContent('Choose a fruit');
    expect(trigger).toHaveClass('ore-drop-down__trigger--placeholder');
  });

  it('should not select a disabled option on click and keep the list open', async () => {
    const onChange = vi.fn();
    render(<DropDown items={items} onChange={onChange} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('option', { name: 'Cherry' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('should skip disabled options when moving the highlight with arrow keys', async () => {
    render(<DropDown items={items} />);

    await user.click(screen.getByRole('button'));
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveClass('ore-drop-down__option--highlighted');

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Date' })).toHaveClass('ore-drop-down__option--highlighted');
  });

  it('should close on Escape', async () => {
    render(<DropDown items={items} />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('should move the highlight to the first and last option with Home and End', async () => {
    render(<DropDown items={items} />);

    await user.click(screen.getByRole('button'));
    await user.keyboard('{End}');
    expect(screen.getByRole('option', { name: 'Date' })).toHaveClass('ore-drop-down__option--highlighted');

    await user.keyboard('{Home}');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveClass('ore-drop-down__option--highlighted');
  });

  it('should filter options case-insensitively when enableSearch is set', async () => {
    render(<DropDown items={items} enableSearch />);

    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('textbox'), 'AN');

    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Apple' })).not.toBeInTheDocument();
  });

  it('should show the localized no-results message when nothing matches', async () => {
    render(<DropDown items={items} enableSearch />);

    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('textbox'), 'zzz');

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('should expose listbox semantics via aria attributes', async () => {
    render(<DropDown items={items} value="banana" />);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');

    await user.click(trigger);
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('should forward rest props and style to the root and merge className', () => {
    render(<DropDown items={items} data-testid="dropdown" className="extra" style={{ color: 'rgb(255, 0, 0)' }} />);

    const root = screen.getByTestId('dropdown');
    expect(root).toHaveClass('ore-drop-down', 'extra');
    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
