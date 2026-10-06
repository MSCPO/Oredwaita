import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TextArea } from './TextArea';

describe('<TextArea />', () => {
  const user = userEvent.setup();

  it('should render a multi-line text entry with a placeholder', () => {
    render(<TextArea placeholder="Share your feedback" aria-label="Feedback" />);

    expect(screen.getByPlaceholderText('Share your feedback')).toBeInTheDocument();
  });

  it('should start from defaultValue when uncontrolled', () => {
    render(<TextArea defaultValue="Once upon a time" aria-label="Feedback" />);

    expect(screen.getByLabelText('Feedback')).toHaveValue('Once upon a time');
  });

  it('should update its value and call onChange with a string when uncontrolled', async () => {
    const onChange = vi.fn();
    render(<TextArea onChange={onChange} aria-label="Feedback" />);

    const textArea = screen.getByLabelText('Feedback');
    await user.type(textArea, 'Nice');

    expect(textArea).toHaveValue('Nice');
    expect(onChange).toHaveBeenLastCalledWith('Nice');
  });

  it('should keep the controlled value and call onChange when typing', async () => {
    const onChange = vi.fn();
    render(<TextArea value="Draft" onChange={onChange} aria-label="Feedback" />);

    const textArea = screen.getByLabelText('Feedback');
    await user.type(textArea, 'x');

    expect(onChange).toHaveBeenCalledWith('Draftx');
    expect(textArea).toHaveValue('Draft');
  });

  it('should prefer the controlled value over defaultValue', async () => {
    const onChange = vi.fn();
    render(<TextArea value="One" defaultValue="Two" onChange={onChange} aria-label="Feedback" />);

    const textArea = screen.getByLabelText('Feedback');
    expect(textArea).toHaveValue('One');

    await user.type(textArea, '!');
    expect(onChange).toHaveBeenCalledWith('One!');
    expect(textArea).toHaveValue('One');
  });

  it('should not accept input when disabled and expose the disabled modifier', async () => {
    const onChange = vi.fn();
    render(<TextArea defaultValue="Once upon a time" onChange={onChange} disabled aria-label="Feedback" />);

    const textArea = screen.getByLabelText('Feedback');
    expect(textArea).toBeDisabled();
    expect(textArea).toHaveClass('ore-text-area--disabled');

    await user.type(textArea, 'x');
    expect(onChange).not.toHaveBeenCalled();
    expect(textArea).toHaveValue('Once upon a time');
  });

  it('should merge the custom className with the block class', () => {
    render(<TextArea className="my-text-area" aria-label="Feedback" />);

    expect(screen.getByLabelText('Feedback')).toHaveClass('ore-text-area', 'my-text-area');
  });

  it('should forward rows, extra attributes and style to the textarea', () => {
    render(
      <TextArea rows={6} name="notes" data-testid="text-area" style={{ color: 'rgb(255, 0, 0)' }} aria-label="Notes" />,
    );

    const textArea = screen.getByTestId('text-area');
    expect(textArea).toHaveAttribute('rows', '6');
    expect(textArea).toHaveAttribute('name', 'notes');
    expect(textArea).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('should default to four rows', () => {
    render(<TextArea data-testid="text-area" aria-label="Notes" />);

    expect(screen.getByTestId('text-area')).toHaveAttribute('rows', '4');
  });
});
