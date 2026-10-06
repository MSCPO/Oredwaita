import {
  type FC,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import cx from 'clsx';
import { Check, ChevronDown } from 'lucide-react';

import { useAnchoredPosition } from '../../hooks/useAnchoredPosition';
import { useOverlayBehavior } from '../../hooks/useOverlayBehavior';
import { SearchEntry } from '../Controls/SearchBar';
import { useOreLabels } from '../ThemeProvider/ThemeProvider';
import './DropDown.scss';

export interface DropDownItem {
  value: string;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

const filterItems = (list: DropDownItem[], rawQuery: string): DropDownItem[] => {
  const needle = rawQuery.trim().toLowerCase();
  if (!needle) {
    return list;
  }

  return list.filter((item) => {
    const text = typeof item.label === 'string' ? item.label : item.value;

    return text.toLowerCase().includes(needle) || item.value.toLowerCase().includes(needle);
  });
};

const getInitialHighlightIndex = (list: DropDownItem[], currentValue: string | undefined): number => {
  const selectedIndex = list.findIndex((item) => !item.disabled && item.value === currentValue);
  if (selectedIndex !== -1) {
    return selectedIndex;
  }

  return list.findIndex((item) => !item.disabled);
};

export interface DropDownProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: DropDownItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  enableSearch?: boolean;
  placeholder?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * DropDown — a standalone select control following the GNOME HIG / GtkDropDown
 * pattern: a trigger button that opens a floating, keyboard-navigable list of
 * options, with an optional search entry to filter the items.
 */
export const DropDown: FC<DropDownProps> = ({
  items,
  value,
  defaultValue,
  onChange,
  enableSearch = false,
  placeholder,
  ref,
  className,
  style,
  ...rest
}) => {
  const labels = useOreLabels();
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const { ref: popupRef, style: anchoredStyle } = useAnchoredPosition({
    anchorRef: triggerRef,
    placement: 'bottom',
    active: open,
  });
  const listRef = useRef<HTMLDivElement>(null);

  const listId = useId();
  const getOptionId = (index: number) => `${listId}-option-${index}`;

  const currentValue = value !== undefined ? value : internalValue;
  const selectedItem = items.find((item) => item.value === currentValue);

  const visibleItems = useMemo(() => filterItems(items, query), [items, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const openList = () => {
    setQuery('');
    setHighlightedIndex(getInitialHighlightIndex(items, currentValue));
    setOpen(true);
  };

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
    setHighlightedIndex(getInitialHighlightIndex(filterItems(items, nextQuery), currentValue));
  };

  const select = useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
      close();
    },
    [value, onChange, close],
  );

  useOverlayBehavior({ open, onClose: close, containerRef: popupRef, modal: false });

  // Move initial focus into the list (or the search entry) once the popup opens.
  useEffect(() => {
    if (!open) {
      return;
    }
    const searchInput = enableSearch ? popupRef.current?.querySelector<HTMLInputElement>('input') : null;
    (searchInput ?? listRef.current)?.focus();
  }, [open, enableSearch, popupRef]);

  // Keep the highlighted option visible.
  useEffect(() => {
    if (!open || highlightedIndex < 0) {
      return;
    }
    const node = listRef.current?.children[highlightedIndex] as HTMLElement | undefined;
    node?.scrollIntoView({ block: 'nearest' });
  }, [open, highlightedIndex]);

  // Close on pointer-down outside of the popup and the trigger.
  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        (!triggerRef.current || !triggerRef.current.contains(event.target as Node))
      ) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, close, popupRef]);

  const moveHighlight = useCallback(
    (direction: 1 | -1) => {
      const count = visibleItems.length;
      if (count === 0) {
        return;
      }
      let index = highlightedIndex === -1 ? (direction === 1 ? -1 : 0) : highlightedIndex;
      for (let step = 0; step < count; step++) {
        index = (index + direction + count) % count;
        if (!visibleItems[index].disabled) {
          setHighlightedIndex(index);

          return;
        }
      }
    },
    [visibleItems, highlightedIndex],
  );

  const selectHighlighted = useCallback(() => {
    const item = visibleItems[highlightedIndex];
    if (item && !item.disabled) {
      select(item.value);
    }
  }, [visibleItems, highlightedIndex, select]);

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openList();
    }
  };

  const handleListKeydown = useCallback(
    (event: KeyboardEvent) => {
      const isSearchInput = event.target instanceof HTMLInputElement;
      const isPopupButton = event.target instanceof HTMLButtonElement;
      switch (event.key) {
        case 'Tab':
          event.preventDefault();
          close();
          break;
        case 'ArrowDown':
          event.preventDefault();
          moveHighlight(1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          moveHighlight(-1);
          break;
        case 'Home':
          if (!isSearchInput && visibleItems.length > 0) {
            event.preventDefault();
            setHighlightedIndex(0);
          }
          break;
        case 'End':
          if (!isSearchInput && visibleItems.length > 0) {
            event.preventDefault();
            setHighlightedIndex(visibleItems.length - 1);
          }
          break;
        case 'Enter':
          if (!isPopupButton) {
            event.preventDefault();
            selectHighlighted();
          }
          break;
        case ' ':
          if (!isSearchInput && !isPopupButton) {
            event.preventDefault();
            selectHighlighted();
          }
          break;
        default:
          break;
      }
    },
    [close, moveHighlight, selectHighlighted, visibleItems],
  );

  // Keyboard navigation works from the list and the search entry alike while the popup is open.
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    document.addEventListener('keydown', handleListKeydown);

    return () => document.removeEventListener('keydown', handleListKeydown);
  }, [open, handleListKeydown]);

  const renderOption = (item: DropDownItem, index: number) => {
    const selected = item.value === currentValue;

    return (
      <div
        key={item.value}
        id={getOptionId(index)}
        role="option"
        tabIndex={-1}
        aria-selected={selected}
        aria-disabled={item.disabled || undefined}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (!item.disabled) {
            select(item.value);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!item.disabled) {
              select(item.value);
            }
          }
        }}
        className={cx('ore-drop-down__option', {
          'ore-drop-down__option--selected': selected,
          'ore-drop-down__option--highlighted': index === highlightedIndex,
          'ore-drop-down__option--disabled': item.disabled,
        })}
      >
        <span className="ore-drop-down__check" aria-hidden="true">
          {selected && <Check size={14} />}
        </span>
        {item.icon && (
          <span className="ore-drop-down__option-icon" aria-hidden="true">
            {item.icon}
          </span>
        )}
        <span className="ore-drop-down__option-label">{item.label ?? item.value}</span>
      </div>
    );
  };

  return (
    <div {...rest} ref={ref} className={cx('ore-drop-down', className)} style={style}>
      <button
        type="button"
        ref={triggerRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => {
          if (open) {
            close();
          } else {
            openList();
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className={cx('ore-drop-down__trigger', {
          'ore-drop-down__trigger--open': open,
          'ore-drop-down__trigger--placeholder': !selectedItem,
        })}
      >
        {selectedItem ? (
          <>
            {selectedItem.icon && (
              <span className="ore-drop-down__option-icon" aria-hidden="true">
                {selectedItem.icon}
              </span>
            )}
            <span className="ore-drop-down__value">{selectedItem.label ?? selectedItem.value}</span>
          </>
        ) : (
          placeholder !== undefined && placeholder !== '' && <span className="ore-drop-down__value">{placeholder}</span>
        )}
        <span className="ore-drop-down__chevron" aria-hidden="true">
          <ChevronDown size={16} />
        </span>
      </button>

      {open &&
        createPortal(
          <div ref={popupRef} className="ore-drop-down__popup" style={anchoredStyle}>
            {enableSearch && (
              <SearchEntry
                className="ore-drop-down__search"
                value={query}
                onChange={handleQueryChange}
                placeholder={placeholder}
              />
            )}
            <div
              ref={listRef}
              id={listId}
              role="listbox"
              tabIndex={-1}
              aria-activedescendant={highlightedIndex >= 0 ? getOptionId(highlightedIndex) : undefined}
              className="ore-drop-down__list"
            >
              {visibleItems.length > 0 ? (
                visibleItems.map(renderOption)
              ) : (
                <div className="ore-drop-down__empty">{labels.noResults}</div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
