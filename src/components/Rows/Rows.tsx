import { type FC, type HTMLAttributes, type KeyboardEvent, type ReactNode, useId, useState } from 'react';
import cx from 'clsx';
import { ExternalLink, Eye, EyeOff } from 'lucide-react';

import { Switch } from '../Switch/Switch';
import { Button } from '../Button/Button';
import { SpinButton } from '../Controls/Controls';
import { useOreLabels } from '../ThemeProvider/ThemeProvider';
import './Rows.scss';

/* Base PreferencesRow */
export interface PreferencesRowProps {
  title: ReactNode;
  titleLines?: number;
  selectable?: boolean;
  className?: string;
  children?: ReactNode;
}

export const PreferencesRow: FC<PreferencesRowProps> = ({ title, selectable = false, className, children }) => {
  return (
    <div className={cx('ore-preferences-row', { 'ore-preferences-row--selectable': selectable }, className)}>
      {typeof title === 'string' ? <span className="ore-preferences-row__title">{title}</span> : title}
      {children}
    </div>
  );
};

/* ActionRow */
export interface ActionRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'prefix'> {
  title: ReactNode;
  titleId?: string;
  subtitle?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  activatable?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

export const ActionRow: FC<ActionRowProps> = ({
  title,
  titleId,
  subtitle,
  prefix,
  suffix,
  activatable = false,
  onClick,
  className,
  style,
  onKeyDown,
  children,
  ...rest
}) => {
  const clickable = Boolean(onClick);

  const handleKeydown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (!onClick || event.target !== event.currentTarget) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      {...rest}
      className={cx('ore-action-row', { 'ore-action-row--activatable': activatable || clickable }, className)}
      style={style}
      onClick={onClick}
      onKeyDown={clickable || onKeyDown ? handleKeydown : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {prefix && <div className="ore-action-row__prefix">{prefix}</div>}
      <div className="ore-action-row__header">
        <div id={titleId} className="ore-action-row__title">
          {title}
        </div>
        {subtitle && <div className="ore-action-row__subtitle">{subtitle}</div>}
      </div>
      {children}
      {suffix && <div className="ore-action-row__suffix">{suffix}</div>}
    </div>
  );
};

/* ExpanderRow */
export interface ExpanderRowProps extends ActionRowProps {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  showEnableSwitch?: boolean;
  enableSwitchChecked?: boolean;
  onEnableSwitchChange?: (checked: boolean) => void;
  expandIcon?: ReactNode;
  /** Accessible label of the collapsed expander toggle; falls back to the localized expand label. */
  expandLabel?: string;
  /** Accessible label of the expanded expander toggle; falls back to the localized collapse label. */
  collapseLabel?: string;
}

export const ExpanderRow: FC<ExpanderRowProps> = ({
  title,
  subtitle,
  prefix,
  suffix,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  showEnableSwitch = false,
  enableSwitchChecked = false,
  onEnableSwitchChange,
  expandIcon = '▾',
  expandLabel,
  collapseLabel,
  className,
  style,
  children,
  ...rest
}) => {
  const labels = useOreLabels();
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : uncontrolledExpanded;

  const toggleExpand = () => {
    const next = !isExpanded;
    if (controlledExpanded === undefined) {
      setUncontrolledExpanded(next);
    }
    onExpandedChange?.(next);
  };

  return (
    <div
      {...rest}
      className={cx('ore-expander-row', { 'ore-expander-row--expanded': isExpanded }, className)}
      style={style}
    >
      <ActionRow
        title={title}
        subtitle={subtitle}
        prefix={prefix}
        suffix={
          <div className="ore-expander-row__actions">
            {showEnableSwitch && (
              <span
                role="presentation"
                className="ore-action-row__control"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <Switch checked={enableSwitchChecked} onChange={(chk) => onEnableSwitchChange?.(chk)} />
              </span>
            )}
            {suffix}
            <button
              type="button"
              className="ore-expander-row__arrow"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? (collapseLabel ?? labels.collapseRow) : (expandLabel ?? labels.expandRow)}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand();
              }}
            >
              {expandIcon}
            </button>
          </div>
        }
        activatable
        onClick={toggleExpand}
      />
      {isExpanded && <div className="ore-expander-row__children">{children}</div>}
    </div>
  );
};

/* SwitchRow */
export interface SwitchRowProps extends Omit<ActionRowProps, 'suffix'> {
  active?: boolean;
  defaultActive?: boolean;
  onActiveChange?: (active: boolean) => void;
  disabled?: boolean;
}

export const SwitchRow: FC<SwitchRowProps> = ({
  title,
  subtitle,
  prefix,
  active: controlledActive,
  defaultActive = false,
  onActiveChange,
  disabled = false,
  className,
  style,
  ...rest
}) => {
  const titleId = useId();
  const [innerActive, setInnerActive] = useState(defaultActive);
  const isActive = controlledActive !== undefined ? controlledActive : innerActive;

  const toggleActive = () => {
    const next = !isActive;
    if (controlledActive === undefined) {
      setInnerActive(next);
    }
    onActiveChange?.(next);
  };

  return (
    <ActionRow
      {...rest}
      title={title}
      titleId={titleId}
      subtitle={subtitle}
      prefix={prefix}
      suffix={
        <span
          role="presentation"
          className="ore-action-row__control"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Switch checked={isActive} onChange={() => toggleActive()} disabled={disabled} aria-labelledby={titleId} />
        </span>
      }
      activatable={!disabled}
      onClick={() => !disabled && toggleActive()}
      className={className}
      style={style}
    />
  );
};

/* EntryRow */
export interface EntryRowProps extends Omit<ActionRowProps, 'suffix' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showApplyButton?: boolean;
  onApply?: () => void;
  /** Label of the apply button; falls back to the localized apply label. */
  applyLabel?: ReactNode;
  disabled?: boolean;
}

export const EntryRow: FC<EntryRowProps> = ({
  title,
  subtitle,
  prefix,
  value,
  onChange,
  placeholder,
  showApplyButton = false,
  onApply,
  applyLabel,
  disabled = false,
  className,
  style,
  ...rest
}) => {
  const labels = useOreLabels();

  return (
    <ActionRow
      {...rest}
      title={title}
      subtitle={subtitle}
      prefix={prefix}
      suffix={
        <div className="ore-entry-row__wrapper">
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="ore-entry-row__input"
          />
          {showApplyButton && (
            <Button variant="suggested" size="sm" disabled={disabled} onClick={onApply}>
              {applyLabel ?? labels.apply}
            </Button>
          )}
        </div>
      }
      className={cx('ore-entry-row', className)}
      style={style}
    />
  );
};

/* PasswordEntryRow */
export interface PasswordEntryRowProps extends EntryRowProps {
  /** Accessible label of the reveal-password button; falls back to the localized show-password label. */
  showPasswordLabel?: string;
  /** Accessible label of the hide-password button; falls back to the localized hide-password label. */
  hidePasswordLabel?: string;
}

export const PasswordEntryRow: FC<PasswordEntryRowProps> = ({
  title,
  subtitle,
  prefix,
  value,
  onChange,
  placeholder,
  showPasswordLabel,
  hidePasswordLabel,
  disabled = false,
  className,
  style,
  ...rest
}) => {
  const labels = useOreLabels();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ActionRow
      {...rest}
      title={title}
      subtitle={subtitle}
      prefix={prefix}
      suffix={
        <div className="ore-entry-row__wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="ore-entry-row__input"
          />
          <Button
            variant="flat"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={
              showPassword ? (hidePasswordLabel ?? labels.hidePassword) : (showPasswordLabel ?? labels.showPassword)
            }
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
      }
      className={cx('ore-entry-row', className)}
      style={style}
    />
  );
};

/* SpinRow */
export interface SpinRowProps extends Omit<ActionRowProps, 'suffix' | 'onChange'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export const SpinRow: FC<SpinRowProps> = ({
  title,
  subtitle,
  prefix,
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  className,
  style,
  ...rest
}) => {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : innerValue;

  const handleChange = (next: number) => {
    if (controlledValue === undefined) {
      setInnerValue(next);
    }
    onChange?.(next);
  };

  return (
    <ActionRow
      {...rest}
      title={title}
      subtitle={subtitle}
      prefix={prefix}
      suffix={<SpinButton value={value} min={min} max={max} step={step} onChange={handleChange} disabled={disabled} />}
      className={className}
      style={style}
    />
  );
};

/* ComboRow */
export interface ComboOption {
  label: string;
  value: string;
}

export interface ComboRowProps extends Omit<ActionRowProps, 'suffix' | 'onSelect'> {
  options: ComboOption[];
  selected?: string;
  defaultSelected?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;
}

export const ComboRow: FC<ComboRowProps> = ({
  title,
  subtitle,
  prefix,
  options,
  selected: controlledSelected,
  defaultSelected,
  onSelect,
  disabled = false,
  className,
  style,
  ...rest
}) => {
  const [innerSelected, setInnerSelected] = useState(defaultSelected ?? options[0]?.value ?? '');
  const selected = controlledSelected !== undefined ? controlledSelected : innerSelected;

  const handleSelect = (next: string) => {
    if (controlledSelected === undefined) {
      setInnerSelected(next);
    }
    onSelect?.(next);
  };

  return (
    <ActionRow
      {...rest}
      title={title}
      subtitle={subtitle}
      prefix={prefix}
      suffix={
        <select
          value={selected}
          disabled={disabled}
          onChange={(e) => handleSelect(e.target.value)}
          className="ore-combo-row__select"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      }
      className={className}
      style={style}
    />
  );
};

/* LinkRow */
export interface LinkRowProps extends ActionRowProps {
  uri: string;
}

export const LinkRow: FC<LinkRowProps> = ({ title, subtitle, prefix, uri, className, style, ...rest }) => {
  return (
    <ActionRow
      {...rest}
      title={title}
      subtitle={subtitle}
      prefix={prefix}
      suffix={
        <span className="ore-link-row__icon">
          <ExternalLink size={16} />
        </span>
      }
      activatable
      onClick={() => window.open(uri, '_blank', 'noopener,noreferrer')}
      className={className}
      style={style}
    />
  );
};

/* ButtonRow */
export interface ButtonRowProps extends Omit<ActionRowProps, 'suffix'> {
  buttonLabel: ReactNode;
  onButtonClick: () => void;
  variant?: 'default' | 'suggested' | 'destructive';
}

export const ButtonRow: FC<ButtonRowProps> = ({
  title,
  subtitle,
  prefix,
  buttonLabel,
  onButtonClick,
  variant = 'default',
  className,
  style,
  ...rest
}) => {
  return (
    <ActionRow
      {...rest}
      title={title}
      subtitle={subtitle}
      prefix={prefix}
      suffix={
        <Button variant={variant} onClick={onButtonClick}>
          {buttonLabel}
        </Button>
      }
      className={className}
      style={style}
    />
  );
};

/* ShortcutRow */
export interface ShortcutRowProps extends ActionRowProps {
  accelerator: string;
}

export const ShortcutRow: FC<ShortcutRowProps> = ({
  title,
  subtitle,
  prefix,
  accelerator,
  className,
  style,
  ...rest
}) => {
  const keys = accelerator.split('+');

  return (
    <ActionRow
      {...rest}
      title={title}
      subtitle={subtitle}
      prefix={prefix}
      suffix={
        <div className="ore-shortcut-row__keys">
          {keys.map((k, i) => (
            <kbd key={i} className="ore-shortcut-row__kbd">
              {k.trim()}
            </kbd>
          ))}
        </div>
      }
      className={className}
      style={style}
    />
  );
};
