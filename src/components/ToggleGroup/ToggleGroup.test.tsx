import { type ReactNode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ToggleButton, ToggleGroup } from '../ToggleGroup';

const SingleSelectHarness = ({ onChange }: { onChange?: (value: string) => void }) => {
  const [value, setValue] = useState('a');

  return (
    <ToggleGroup
      value={value}
      onChange={(next) => {
        setValue(next as string);
        onChange?.(next as string);
      }}
    >
      <ToggleButton value="a">Alpha</ToggleButton>
      <ToggleButton value="b">Beta</ToggleButton>
      <ToggleButton value="c">Gamma</ToggleButton>
    </ToggleGroup>
  );
};

const ButtonWrapper = ({ children }: { children: ReactNode }) => <div>{children}</div>;

describe('<ToggleGroup /> single select', () => {
  it('should render a radiogroup with roving tabindex', () => {
    render(<SingleSelectHarness />);

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).toHaveAttribute('tabindex', '0');
    expect(radios[1]).toHaveAttribute('tabindex', '-1');
  });

  it('should move selection with arrow keys and follow focus', () => {
    render(<SingleSelectHarness />);

    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    const beta = screen.getByRole('radio', { name: 'Beta' });
    expect(beta).toHaveAttribute('aria-checked', 'true');
    expect(beta).toHaveFocus();

    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveAttribute('aria-checked', 'true');
  });

  it('should wrap around at both ends', () => {
    render(<SingleSelectHarness />);

    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(screen.getByRole('radio', { name: 'Gamma' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveAttribute('aria-checked', 'true');
  });
});

describe('<ToggleGroup /> multiple', () => {
  it('should keep group/aria-pressed semantics', () => {
    render(
      <ToggleGroup value={['a']} multiple onChange={vi.fn()}>
        <ToggleButton value="a">Alpha</ToggleButton>
      </ToggleGroup>,
    );

    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Alpha' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('<ToggleGroup /> uncontrolled', () => {
  const user = userEvent.setup();

  it('should support defaultValue for uncontrolled single selection', async () => {
    const handleChange = vi.fn();
    render(
      <ToggleGroup defaultValue="b" onChange={handleChange}>
        <ToggleButton value="a">Alpha</ToggleButton>
        <ToggleButton value="b">Beta</ToggleButton>
      </ToggleGroup>,
    );

    expect(screen.getByRole('radio', { name: 'Beta' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Beta' })).toHaveAttribute('tabindex', '0');

    await user.click(screen.getByRole('radio', { name: 'Alpha' }));

    expect(handleChange).toHaveBeenCalledWith('a');
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Beta' })).toHaveAttribute('aria-checked', 'false');
  });

  it('should support a defaultValue array in multiple mode', async () => {
    const handleChange = vi.fn();
    render(
      <ToggleGroup defaultValue={['a', 'c']} multiple onChange={handleChange}>
        <ToggleButton value="a">Alpha</ToggleButton>
        <ToggleButton value="b">Beta</ToggleButton>
        <ToggleButton value="c">Gamma</ToggleButton>
      </ToggleGroup>,
    );

    expect(screen.getByRole('button', { name: 'Alpha' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Gamma' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Alpha' }));

    expect(handleChange).toHaveBeenCalledWith(['c']);
    expect(screen.getByRole('button', { name: 'Alpha' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('should prefer the controlled value over defaultValue', async () => {
    const handleChange = vi.fn();
    render(
      <ToggleGroup defaultValue="b" value="a" onChange={handleChange}>
        <ToggleButton value="a">Alpha</ToggleButton>
        <ToggleButton value="b">Beta</ToggleButton>
      </ToggleGroup>,
    );

    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('radio', { name: 'Beta' }));

    expect(handleChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveAttribute('aria-checked', 'true');
  });

  it('should start with no selection when neither value nor defaultValue is provided', async () => {
    const handleChange = vi.fn();
    render(
      <ToggleGroup onChange={handleChange}>
        <ToggleButton value="a">Alpha</ToggleButton>
        <ToggleButton value="b">Beta</ToggleButton>
      </ToggleGroup>,
    );

    screen.getAllByRole('radio').forEach((radio) => expect(radio).not.toHaveAttribute('aria-checked', 'true'));

    await user.click(screen.getByRole('radio', { name: 'Beta' }));

    expect(handleChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('radio', { name: 'Beta' })).toHaveAttribute('aria-checked', 'true');
  });
});

describe('<ToggleGroup /> composition and passthrough', () => {
  const user = userEvent.setup();

  it('should keep working when ToggleButton is nested inside intermediate components', async () => {
    const handleChange = vi.fn();
    render(
      <ToggleGroup defaultValue="a" onChange={handleChange}>
        <div>
          <ButtonWrapper>
            <ToggleButton value="a">Alpha</ToggleButton>
          </ButtonWrapper>
          <ToggleButton value="b">Beta</ToggleButton>
        </div>
      </ToggleGroup>,
    );

    const alpha = screen.getByRole('radio', { name: 'Alpha' });
    const beta = screen.getByRole('radio', { name: 'Beta' });

    expect(alpha).toHaveAttribute('aria-checked', 'true');

    await user.click(beta);

    expect(handleChange).toHaveBeenCalledWith('b');
    expect(beta).toHaveAttribute('aria-checked', 'true');
    expect(alpha).toHaveAttribute('aria-checked', 'false');

    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' });

    expect(alpha).toHaveAttribute('aria-checked', 'true');
    expect(alpha).toHaveFocus();
  });

  it('should trigger both the explicit onSelect prop and the group handler', async () => {
    const handleSelect = vi.fn();
    const handleChange = vi.fn();
    render(
      <ToggleGroup defaultValue="a" onChange={handleChange}>
        <ToggleButton value="a">Alpha</ToggleButton>
        <ToggleButton value="b" onSelect={handleSelect}>
          Beta
        </ToggleButton>
      </ToggleGroup>,
    );

    await user.click(screen.getByRole('radio', { name: 'Beta' }));

    expect(handleSelect).toHaveBeenCalledWith('b');
    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('should forward rest props and style to the root element', () => {
    render(
      <ToggleGroup
        data-testid="toggle-group-root"
        onChange={vi.fn()}
        style={{ backgroundColor: 'rgb(1, 2, 3)' }}
        title="Group"
      >
        <ToggleButton value="a">Alpha</ToggleButton>
      </ToggleGroup>,
    );

    const root = screen.getByTestId('toggle-group-root');
    expect(root).toHaveClass('ore-toggle-group');
    expect(root).toHaveAttribute('title', 'Group');
    expect(root).toHaveStyle('background-color: rgb(1, 2, 3)');
  });

  it('should keep standalone ToggleButton behavior with explicit props', async () => {
    const handleSelect = vi.fn();
    render(
      <ToggleButton value="a" selected onSelect={handleSelect}>
        Alpha
      </ToggleButton>,
    );

    const button = screen.getByRole('button', { name: 'Alpha' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).not.toHaveAttribute('role');

    await user.click(button);

    expect(handleSelect).toHaveBeenCalledWith('a');
  });
});
