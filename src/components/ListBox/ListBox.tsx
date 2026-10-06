import {
  type CSSProperties,
  type FC,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import cx from 'clsx';

import './ListBox.scss';

/** One selectable row of a ListBox. */
export interface ListBoxItem {
  /** Unique value reported by `onChange` when the row is activated. */
  value: string;
  /** Row content; falls back to `value` when omitted. */
  label?: ReactNode;
  /** Optional leading icon rendered before the label. */
  icon?: ReactNode;
  /** Disables the row so it cannot be selected or focused. */
  disabled?: boolean;
}

interface ListBoxFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: ListBoxItem[];
  /** Values currently selected, normalized to strings. */
  selectedValues: string[];
  /** Activates a row; each mode wrapper decides how the selection changes. */
  onActivate: (value: string) => void;
  ref?: Ref<HTMLDivElement>;
}

const ListBoxFrame: FC<ListBoxFrameProps> = ({ items, selectedValues, onActivate, className, style, ref, ...rest }) => {
  const labelsId = useId();
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const firstEnabledIndex = useMemo(() => items.findIndex((item) => !item.disabled), [items]);
  const [activeIndex, setActiveIndex] = useState(() => (firstEnabledIndex >= 0 ? firstEnabledIndex : 0));

  const focusOption = (index: number) => {
    optionRefs.current[index]?.focus();
  };

  const moveFocus = (from: number, step: 1 | -1) => {
    let index = from + step;

    while (index >= 0 && index < items.length) {
      if (!items[index].disabled) {
        focusOption(index);

        return;
      }
      index += step;
    }
  };

  const handleOptionKeyDown = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    const item = items[index];

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(index, event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const enabledIndexes = items.map((entry, i) => (entry.disabled ? -1 : i)).filter((i) => i >= 0);
      focusOption(event.key === 'Home' ? enabledIndexes[0] : enabledIndexes[enabledIndexes.length - 1]);
    } else if ((event.key === 'Enter' || event.key === ' ') && !item.disabled) {
      event.preventDefault();
      onActivate(item.value);
    }
  };

  return (
    <div {...rest} ref={ref} role="listbox" className={cx('ore-list-box', className)} style={style}>
      {items.map((item, index) => {
        const selected = selectedValues.includes(item.value);

        return (
          <div
            key={item.value}
            ref={(node) => {
              optionRefs.current[index] = node;
            }}
            id={`${labelsId}-option-${index}`}
            role="option"
            data-value={item.value}
            aria-selected={selected}
            aria-disabled={item.disabled || undefined}
            tabIndex={!item.disabled && index === activeIndex ? 0 : -1}
            onFocus={() => setActiveIndex(index)}
            onClick={() => {
              if (!item.disabled) {
                onActivate(item.value);
              }
            }}
            onKeyDown={(event) => handleOptionKeyDown(event, index)}
            className={cx('ore-list-box__item', {
              'ore-list-box__item--selected': selected,
              'ore-list-box__item--disabled': item.disabled,
            })}
          >
            {item.icon && (
              <span className="ore-list-box__icon" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span className="ore-list-box__label">{item.label ?? item.value}</span>
          </div>
        );
      })}
    </div>
  );
};

interface ListBoxSingleImplProps {
  items: ListBoxItem[];
  /** Controlled selected value; takes precedence over `defaultValue`. */
  value?: string;
  /** Initially selected value for uncontrolled usage. */
  defaultValue?: string;
  /** Called with the selected value after activation. */
  onChange?: (value: string) => void;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
}

const ListBoxSingle: FC<ListBoxSingleImplProps> = ({
  items,
  value: controlledValue,
  defaultValue,
  onChange,
  ...frameProps
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = controlledValue ?? internalValue;
  const selectedValues = selectedValue === undefined ? [] : [selectedValue];

  const handleActivate = (value: string) => {
    if (controlledValue === undefined) {
      setInternalValue(value);
    }
    onChange?.(value);
  };

  return <ListBoxFrame {...frameProps} items={items} selectedValues={selectedValues} onActivate={handleActivate} />;
};

interface ListBoxMultipleImplProps {
  items: ListBoxItem[];
  /** Controlled selected values; takes precedence over `defaultValue`. */
  value?: string[];
  /** Initially selected values for uncontrolled usage. */
  defaultValue?: string[];
  /** Called with the next selection after activating a row. */
  onChange?: (value: string[]) => void;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
}

const ListBoxMultiple: FC<ListBoxMultipleImplProps> = ({
  items,
  value: controlledValue,
  defaultValue,
  onChange,
  ...frameProps
}) => {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const selectedValues = controlledValue ?? internalValue;

  const handleActivate = (value: string) => {
    const next = selectedValues.includes(value)
      ? selectedValues.filter((entry) => entry !== value)
      : [...selectedValues, value];

    if (controlledValue === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  return (
    <ListBoxFrame
      {...frameProps}
      aria-multiselectable
      items={items}
      selectedValues={selectedValues}
      onActivate={handleActivate}
    />
  );
};

export interface ListBoxSingleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: ListBoxItem[];
  selectionMode?: 'single';
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  ref?: Ref<HTMLDivElement>;
}

export interface ListBoxMultipleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: ListBoxItem[];
  selectionMode: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  ref?: Ref<HTMLDivElement>;
}

export type ListBoxProps = ListBoxSingleProps | ListBoxMultipleProps;

/**
 * ListBox following the GtkListBox control semantics.
 *
 * A vertical selection list where rows act as options, as described in the
 * GNOME HIG. Supports single and multiple selection modes with full arrow-key
 * navigation; disabled rows are skipped while moving focus.
 */
export const ListBox: FC<ListBoxProps> = (props) => {
  if (props.selectionMode === 'multiple') {
    const { selectionMode: _selectionMode, ...multipleProps } = props;

    return <ListBoxMultiple {...multipleProps} />;
  }

  const { selectionMode: _selectionMode, ...singleProps } = props;

  return <ListBoxSingle {...singleProps} />;
};
