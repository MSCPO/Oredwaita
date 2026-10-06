import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Entry } from './Entry';

describe('<Entry />', () => {
  const user = userEvent.setup();

  it('should render a single-line text entry with a placeholder', () => {
    render(<Entry placeholder="Enter your name" aria-label="Name" />);

    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('should start from defaultValue when uncontrolled', () => {
    render(<Entry defaultValue="Ada" aria-label="Name" />);

    expect(screen.getByLabelText('Name')).toHaveValue('Ada');
  });

  it('should update its value and call onChange with a string when uncontrolled', async () => {
    const onChange = vi.fn();
    render(<Entry onChange={onChange} aria-label="Name" />);

    const entry = screen.getByLabelText('Name');
    await user.type(entry, 'Ada');

    expect(entry).toHaveValue('Ada');
    expect(onChange).toHaveBeenLastCalledWith('Ada');
  });

  it('should keep the controlled value and call onChange when typing', async () => {
    const onChange = vi.fn();
    render(<Entry value="Libre" onChange={onChange} aria-label="Name" />);

    const entry = screen.getByLabelText('Name');
    await user.type(entry, 'x');

    expect(onChange).toHaveBeenCalledWith('Librex');
    expect(entry).toHaveValue('Libre');
  });

  it('should prefer the controlled value over defaultValue', async () => {
    const onChange = vi.fn();
    render(<Entry value="One" defaultValue="Two" onChange={onChange} aria-label="Name" />);

    const entry = screen.getByLabelText('Name');
    expect(entry).toHaveValue('One');

    await user.type(entry, '!');
    expect(onChange).toHaveBeenCalledWith('One!');
    expect(entry).toHaveValue('One');
  });

  it('should not accept input when disabled and expose the disabled modifier', async () => {
    const onChange = vi.fn();
    render(<Entry defaultValue="Ada" onChange={onChange} disabled aria-label="Name" />);

    const entry = screen.getByLabelText('Name');
    expect(entry).toBeDisabled();
    expect(entry).toHaveClass('ore-entry--disabled');

    await user.type(entry, 'x');
    expect(onChange).not.toHaveBeenCalled();
    expect(entry).toHaveValue('Ada');
  });

  it('should merge the custom className with the block class', () => {
    render(<Entry className="my-entry" aria-label="Name" />);

    expect(screen.getByLabelText('Name')).toHaveClass('ore-entry', 'my-entry');
  });

  it('should forward extra attributes such as name and data-* to the input', () => {
    render(<Entry name="username" data-testid="entry" aria-label="Name" />);

    const entry = screen.getByTestId('entry');
    expect(entry).toHaveAttribute('name', 'username');
  });

  it('should forward the style to the input', () => {
    render(<Entry style={{ color: 'rgb(255, 0, 0)' }} aria-label="Name" />);

    expect(screen.getByLabelText('Name')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
