import { type ChangeEvent, type FC } from 'react';
import cx from 'clsx';
import { Search, X } from 'lucide-react';

import { useOreLabels } from '../ThemeProvider/ThemeProvider';
import './SearchBar.scss';

export interface SearchEntryProps {
  value: string;
  onChange: (value: string) => void;
  /** Input placeholder; falls back to the localized search placeholder. */
  placeholder?: string;
  onClear?: () => void;
  /** Accessible label of the clear button; falls back to the localized clear-search label. */
  clearLabel?: string;
  className?: string;
}

export const SearchEntry: FC<SearchEntryProps> = ({ value, onChange, placeholder, onClear, clearLabel, className }) => {
  const labels = useOreLabels();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={cx('ore-search-entry', className)}>
      <span className="ore-search-entry__icon">
        <Search size={16} />
      </span>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder ?? labels.searchPlaceholder}
        className="ore-search-entry__input"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="ore-search-entry__clear"
          aria-label={clearLabel ?? labels.clearSearch}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
