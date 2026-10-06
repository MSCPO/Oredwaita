import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeProvider } from '../ThemeProvider/ThemeProvider';
import { SplitButton } from '../SplitButton';

describe('<SplitButton />', () => {
  const user = userEvent.setup();

  it('should give the main button an accessible name from aria-label', () => {
    render(<SplitButton label="Save" aria-label="Save changes" onClick={vi.fn()} onDropdownClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('should fall back to the label for the main button accessible name', () => {
    render(<SplitButton label="Save" onClick={vi.fn()} onDropdownClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('should mark the dropdown button as a collapsed menu trigger', async () => {
    const onDropdownClick = vi.fn();
    render(<SplitButton label="Save" onDropdownClick={onDropdownClick} />);

    const dropdown = screen.getByRole('button', { name: 'More options' });
    expect(dropdown).toHaveAttribute('aria-haspopup', 'menu');
    expect(dropdown).not.toHaveAttribute('aria-expanded');

    await user.click(dropdown);
    expect(onDropdownClick).toHaveBeenCalledTimes(1);
  });

  it('should expose aria-expanded on the dropdown button while open', () => {
    render(<SplitButton label="Save" onDropdownClick={vi.fn()} dropdownOpen />);

    expect(screen.getByRole('button', { name: 'More options' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('should trigger the main action from the main button', async () => {
    const onClick = vi.fn();
    render(<SplitButton label="Save" aria-label="Save changes" onClick={onClick} onDropdownClick={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should support a custom dropdown button label', () => {
    render(<SplitButton label="Save" dropdownLabel="Open menu" onDropdownClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'More options' })).not.toBeInTheDocument();
  });

  it('should resolve the dropdown label from the ThemeProvider labels dictionary', () => {
    render(
      <ThemeProvider labels={{ moreOptions: '更多操作' }}>
        <SplitButton label="Save" onDropdownClick={vi.fn()} />
      </ThemeProvider>,
    );

    expect(screen.getByRole('button', { name: '更多操作' })).toBeInTheDocument();
  });
});
