import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeProvider } from '../ThemeProvider/ThemeProvider';
import { SearchEntry } from './SearchBar';

const SearchHarness = ({
  initialValue = '',
  onChange,
  onClear,
}: {
  initialValue?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
}) => {
  const [value, setValue] = useState(initialValue);

  return (
    <SearchEntry
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      onClear={onClear}
    />
  );
};

describe('<SearchEntry />', () => {
  const user = userEvent.setup();

  it('should render a text input with the default placeholder', () => {
    render(<SearchEntry value="" onChange={vi.fn()} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Search...');
  });

  it('should render a custom placeholder', () => {
    render(<SearchEntry value="" onChange={vi.fn()} placeholder="Find a track" />);

    expect(screen.getByPlaceholderText('Find a track')).toBeInTheDocument();
  });

  it('should update the value while typing', async () => {
    const onChange = vi.fn();
    render(<SearchHarness onChange={onChange} />);

    await user.type(screen.getByRole('textbox'), 'abc');

    expect(onChange).toHaveBeenLastCalledWith('abc');
    expect(screen.getByRole('textbox')).toHaveValue('abc');
  });

  it('should not render a clear button while the value is empty', () => {
    render(<SearchEntry value="" onChange={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('should clear the value and report the clear action', async () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    render(<SearchHarness initialValue="query" onChange={onChange} onClear={onClear} />);

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('');
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('should merge the className', () => {
    const { container } = render(<SearchEntry value="" onChange={vi.fn()} className="custom-search" />);

    expect(container.firstElementChild).toHaveClass('ore-search-entry', 'custom-search');
  });

  it('should support a custom clear button label', () => {
    render(<SearchEntry value="query" onChange={vi.fn()} clearLabel="Empty the field" />);

    expect(screen.getByRole('button', { name: 'Empty the field' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('should resolve the placeholder and clear label from the ThemeProvider labels dictionary', () => {
    render(
      <ThemeProvider labels={{ searchPlaceholder: '搜索…', clearSearch: '清空搜索' }}>
        <SearchEntry value="query" onChange={vi.fn()} />
      </ThemeProvider>,
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', '搜索…');
    expect(screen.getByRole('button', { name: '清空搜索' })).toBeInTheDocument();
  });
});
