import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ListBox, type ListBoxItem } from './ListBox';

const fruits: ListBoxItem[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

const withDisabled: ListBoxItem[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
];

describe('<ListBox />', () => {
  const user = userEvent.setup();

  it('should render one option per item and fall back to value as label', () => {
    render(<ListBox items={[{ value: 'settings' }, { value: 'network', label: 'Network' }]} />);

    expect(screen.getByRole('option', { name: 'settings' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Network' })).toBeInTheDocument();
  });

  it('should select a row on click and report its value', async () => {
    const onChange = vi.fn();
    render(<ListBox items={fruits} onChange={onChange} />);

    await user.click(screen.getByRole('option', { name: 'Banana' }));

    expect(onChange).toHaveBeenCalledWith('banana');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
  });

  it('should mark defaultValue as selected initially', () => {
    render(<ListBox items={fruits} defaultValue="cherry" />);

    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'false');
  });

  it('should keep the controlled selection while reporting changes', async () => {
    const onChange = vi.fn();
    render(<ListBox items={fruits} value="apple" onChange={onChange} />);

    await user.click(screen.getByRole('option', { name: 'Cherry' }));

    expect(onChange).toHaveBeenCalledWith('cherry');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('aria-selected', 'false');
  });

  it('should toggle rows independently in multiple mode', async () => {
    const onChange = vi.fn();
    render(<ListBox items={fruits} selectionMode="multiple" value={['apple']} onChange={onChange} />);

    await user.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onChange).toHaveBeenCalledWith(['apple', 'cherry']);
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');

    await user.click(screen.getByRole('option', { name: 'Apple' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('should not activate disabled rows and mark them aria-disabled', async () => {
    const onChange = vi.fn();
    render(<ListBox items={withDisabled} onChange={onChange} />);

    const disabled = screen.getByRole('option', { name: 'Banana' });
    expect(disabled).toHaveAttribute('aria-disabled', 'true');

    await user.click(disabled);
    expect(onChange).not.toHaveBeenCalled();
    expect(disabled).toHaveAttribute('aria-selected', 'false');
  });

  it('should skip disabled rows when moving focus with ArrowDown', () => {
    render(<ListBox items={withDisabled} />);

    const apple = screen.getByRole('option', { name: 'Apple' });
    fireEvent.focus(apple);
    fireEvent.keyDown(apple, { key: 'ArrowDown' });

    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveFocus();
  });

  it('should move focus with ArrowUp/ArrowDown', () => {
    render(<ListBox items={fruits} />);

    const apple = screen.getByRole('option', { name: 'Apple' });
    const banana = screen.getByRole('option', { name: 'Banana' });
    const cherry = screen.getByRole('option', { name: 'Cherry' });

    fireEvent.focus(banana);
    fireEvent.keyDown(banana, { key: 'ArrowDown' });
    expect(cherry).toHaveFocus();

    fireEvent.keyDown(cherry, { key: 'ArrowUp' });
    expect(banana).toHaveFocus();

    expect(apple).not.toHaveFocus();
  });

  it('should move focus to the first/last enabled row with Home/End', () => {
    render(<ListBox items={withDisabled} />);

    const apple = screen.getByRole('option', { name: 'Apple' });
    const cherry = screen.getByRole('option', { name: 'Cherry' });

    fireEvent.focus(apple);
    fireEvent.keyDown(apple, { key: 'End' });
    expect(cherry).toHaveFocus();

    fireEvent.keyDown(cherry, { key: 'Home' });
    expect(apple).toHaveFocus();
  });

  it('should activate the focused row with Enter and Space in single mode', () => {
    const onChange = vi.fn();
    render(<ListBox items={fruits} onChange={onChange} />);

    const banana = screen.getByRole('option', { name: 'Banana' });
    fireEvent.keyDown(banana, { key: 'Enter' });
    fireEvent.keyDown(banana, { key: ' ' });

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, 'banana');
    expect(onChange).toHaveBeenNthCalledWith(2, 'banana');
  });

  it('should toggle only the activated row with Enter in multiple mode', () => {
    const onChange = vi.fn();
    render(<ListBox items={fruits} selectionMode="multiple" defaultValue={['apple', 'cherry']} onChange={onChange} />);

    const banana = screen.getByRole('option', { name: 'Banana' });
    fireEvent.focus(banana);
    fireEvent.keyDown(banana, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['apple', 'cherry', 'banana']);

    const apple = screen.getByRole('option', { name: 'Apple' });
    fireEvent.keyDown(apple, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['cherry', 'banana']);
  });

  it('should expose listbox semantics with aria-multiselectable in multiple mode', () => {
    const { rerender } = render(<ListBox items={fruits} />);

    const list = screen.getByRole('listbox');
    expect(list).not.toHaveAttribute('aria-multiselectable');
    expect(screen.getAllByRole('option')).toHaveLength(3);

    rerender(<ListBox items={fruits} selectionMode="multiple" />);
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
  });

  it('should render the item icon before the label', () => {
    render(<ListBox items={[{ value: 'star', label: 'Starred', icon: <span data-testid="star-icon" /> }]} />);

    const option = screen.getByRole('option', { name: 'Starred' });
    expect(option.querySelector('[data-testid="star-icon"]')).toBeInTheDocument();
  });

  it('should use a roving tabindex across the options', () => {
    render(<ListBox items={fruits} />);

    const apple = screen.getByRole('option', { name: 'Apple' });
    const banana = screen.getByRole('option', { name: 'Banana' });
    const cherry = screen.getByRole('option', { name: 'Cherry' });

    expect(apple).toHaveAttribute('tabindex', '0');
    expect(banana).toHaveAttribute('tabindex', '-1');
    expect(cherry).toHaveAttribute('tabindex', '-1');

    fireEvent.focus(cherry);
    expect(cherry).toHaveAttribute('tabindex', '0');
    expect(apple).toHaveAttribute('tabindex', '-1');
  });

  it('should forward extra props, style and className to the root element', () => {
    render(<ListBox items={fruits} data-testid="list" className="extra-class" style={{ color: 'rgb(255, 0, 0)' }} />);

    const root = screen.getByTestId('list');
    expect(root).toHaveClass('ore-list-box', 'extra-class');
    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
