import {
  createContext,
  type FC,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import cx from 'clsx';
import './ToggleGroup.scss';

interface ToggleGroupContextValue {
  /** Currently selected values, normalized to strings. */
  selectedValues: string[];
  /** Whether the owning group allows multiple selections. */
  multiple: boolean;
  /** Handles a selection request coming from any ToggleButton inside the group. */
  onSelect: (value: string) => void;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | undefined>(undefined);

export interface ToggleButtonProps {
  value: string;
  /** Explicit selection override; when omitted the state is derived from the parent ToggleGroup. */
  selected?: boolean;
  /** Explicit select handler; when omitted the parent ToggleGroup's handler is used. */
  onSelect?: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  /** Ref to the underlying button element. */
  ref?: Ref<HTMLButtonElement>;
  /** Overrides the computed role for standalone usage; ToggleGroup computes radio semantics from context. */
  role?: 'radio';
  tabIndex?: number;
  'aria-checked'?: boolean;
}

export const ToggleButton: FC<ToggleButtonProps> = ({
  value,
  selected: selectedProp,
  onSelect,
  disabled = false,
  children,
  className,
  ref,
  role: roleProp,
  tabIndex: tabIndexProp,
  'aria-checked': ariaCheckedProp,
}) => {
  const group = useContext(ToggleGroupContext);
  const isRadio = group !== undefined && !group.multiple;
  const selected = selectedProp ?? (group !== undefined ? group.selectedValues.includes(value) : false);
  const role = isRadio ? 'radio' : roleProp;
  const tabIndex = isRadio ? (selected ? 0 : -1) : tabIndexProp;
  const ariaChecked = isRadio ? selected : ariaCheckedProp;

  const handleClick = () => {
    if (disabled) {
      return;
    }
    onSelect?.(value);
    group?.onSelect(value);
  };

  return (
    <button
      ref={ref}
      type="button"
      role={role}
      tabIndex={tabIndex}
      aria-checked={ariaChecked}
      aria-pressed={role ? undefined : selected}
      disabled={disabled}
      data-value={value}
      onClick={handleClick}
      className={cx('ore-toggle-button', { 'ore-toggle-button--selected': selected }, className)}
    >
      {children}
    </button>
  );
};

export interface ToggleGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled selection; when provided it takes precedence over `defaultValue`. */
  value?: string | string[];
  /** Initial selection for uncontrolled usage. */
  defaultValue?: string | string[];
  /** Called with the next selection after a toggle (single: string, multiple: string[]). */
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  homogeneous?: boolean;
  children?: ReactNode;
}

export const ToggleGroup: FC<ToggleGroupProps> = ({
  value,
  defaultValue,
  onChange,
  multiple = false,
  homogeneous = false,
  children,
  className,
  style,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState<string | string[] | undefined>(defaultValue);
  const resolvedValue = value !== undefined ? value : internalValue;

  const selectedValues = useMemo<string[]>(() => {
    if (resolvedValue === undefined) {
      return [];
    }
    if (Array.isArray(resolvedValue)) {
      return multiple ? resolvedValue : [];
    }

    return [resolvedValue];
  }, [multiple, resolvedValue]);

  const handleSelect = useCallback(
    (val: string) => {
      let next: string | string[];
      if (multiple) {
        const current = Array.isArray(resolvedValue) ? [...resolvedValue] : [];
        const index = current.indexOf(val);
        if (index > -1) {
          current.splice(index, 1);
        } else {
          current.push(val);
        }
        next = current;
      } else {
        next = val;
      }
      if (value === undefined) {
        setInternalValue(next);
      }
      onChange?.(next);
    },
    [multiple, resolvedValue, value, onChange],
  );

  const contextValue = useMemo<ToggleGroupContextValue>(
    () => ({ selectedValues, multiple, onSelect: handleSelect }),
    [selectedValues, multiple, handleSelect],
  );

  const handleKeydown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (multiple) {
      return;
    }
    const radioElements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
    if (radioElements.length === 0) {
      return;
    }
    const values = radioElements.map((element) => element.dataset.value ?? '');
    const currentIndex = Math.max(values.indexOf(String(resolvedValue)), 0);
    let nextIndex = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % values.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + values.length) % values.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = values.length - 1;
    }
    if (nextIndex >= 0) {
      event.preventDefault();
      handleSelect(values[nextIndex]);
      radioElements[nextIndex]?.focus();
    }
  };

  return (
    <div
      {...rest}
      className={cx('ore-toggle-group', { 'ore-toggle-group--homogeneous': homogeneous }, className)}
      style={style}
      role={multiple ? 'group' : 'radiogroup'}
      onKeyDown={(event) => {
        rest.onKeyDown?.(event);
        handleKeydown(event);
      }}
    >
      <ToggleGroupContext.Provider value={contextValue}>{children}</ToggleGroupContext.Provider>
    </div>
  );
};
