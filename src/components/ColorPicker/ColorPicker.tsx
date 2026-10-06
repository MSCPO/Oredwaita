/* eslint-disable react-refresh/only-export-components -- the preset palette is part of the component's public API */
import {
  type ChangeEvent,
  type FC,
  type HTMLAttributes,
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

import { useAnchoredPosition } from '../../hooks/useAnchoredPosition';
import { useOverlayBehavior } from '../../hooks/useOverlayBehavior';
import { useOreLabels } from '../ThemeProvider/ThemeProvider';
import './ColorPicker.scss';

/** Color kept in component state; alpha is normalized to the 0–1 range. */
interface OreColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Default palette following the GNOME color picker grid of named colors,
 * eight swatches per row.
 */
export const ORE_COLOR_PRESETS: string[] = [
  '#99c1f1',
  '#62a0ea',
  '#3584e4',
  '#1c71d8',
  '#1a5fb4',
  '#8ff0a4',
  '#57e389',
  '#33d17a',
  '#2ec27e',
  '#26a269',
  '#f9f06b',
  '#f8e45c',
  '#f6d32d',
  '#f5c211',
  '#e5a50a',
  '#ffbe6f',
  '#ffa348',
  '#ff7800',
  '#e66100',
  '#c64600',
  '#f66151',
  '#ed333b',
  '#e01b24',
  '#c01c28',
  '#a51d2d',
  '#dc8add',
  '#c061cb',
  '#9141ac',
  '#813d9c',
  '#613583',
  '#cdab8f',
  '#b5835a',
  '#986a44',
  '#865e3c',
  '#63452c',
  '#ffffff',
  '#deddda',
  '#9a9996',
  '#5e5c64',
  '#241f31',
];

const DEFAULT_COLOR: OreColor = { r: 53, g: 132, b: 228, a: 1 };

const clampChannel = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));

const clampAlpha = (value: number): number => Math.max(0, Math.min(1, value));

const toHexPair = (value: number): string => clampChannel(value).toString(16).padStart(2, '0');

/** Lowercase `#rrggbb` form used for preset comparison and the native color input. */
const toHex = ({ r, g, b }: OreColor): string => `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`;

/** Output format: lowercase `#rrggbb`, or `rgba(r, g, b, a)` with two-decimal alpha when `showAlpha` is set. */
const formatColor = (color: OreColor, showAlpha: boolean): string => {
  if (!showAlpha) {
    return toHex(color);
  }

  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a.toFixed(2)})`;
};

/**
 * Parses the accepted color inputs — `#rgb`, `#rrggbb`, `#rrggbbaa` and `rgb()`/`rgba()` strings —
 * into component state; returns null for anything else.
 */
const parseColor = (raw: string): OreColor | null => {
  const value = raw.trim();
  const shortHex = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(value);
  const longHex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value);
  const alphaHex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value);
  const rgbFunction = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(value);

  if (shortHex) {
    return {
      r: parseInt(shortHex[1] + shortHex[1], 16),
      g: parseInt(shortHex[2] + shortHex[2], 16),
      b: parseInt(shortHex[3] + shortHex[3], 16),
      a: 1,
    };
  }

  if (alphaHex) {
    return {
      r: clampChannel(parseInt(alphaHex[1], 16)),
      g: clampChannel(parseInt(alphaHex[2], 16)),
      b: clampChannel(parseInt(alphaHex[3], 16)),
      a: clampAlpha(parseInt(alphaHex[4], 16) / 255),
    };
  }

  if (longHex) {
    return {
      r: clampChannel(parseInt(longHex[1], 16)),
      g: clampChannel(parseInt(longHex[2], 16)),
      b: clampChannel(parseInt(longHex[3], 16)),
      a: 1,
    };
  }

  if (rgbFunction) {
    return {
      r: clampChannel(Number(rgbFunction[1])),
      g: clampChannel(Number(rgbFunction[2])),
      b: clampChannel(Number(rgbFunction[3])),
      a: rgbFunction[4] === undefined ? 1 : clampAlpha(Number(rgbFunction[4])),
    };
  }

  return null;
};

export interface ColorPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (color: string) => void;
  presets?: string[];
  showAlpha?: boolean;
  ref?: Ref<HTMLDivElement>;
}

/**
 * ColorPicker — a color chooser following the GNOME HIG / GtkColorDialog pattern:
 * a circular swatch button that opens a floating panel with a preset palette grid,
 * a custom color row backed by the native color input, and an optional opacity slider.
 */
export const ColorPicker: FC<ColorPickerProps> = ({
  value,
  defaultValue = '#3584e4',
  onChange,
  presets,
  showAlpha = false,
  ref,
  className,
  'aria-label': ariaLabel,
  style,
  ...rest
}) => {
  const labels = useOreLabels();
  const [open, setOpen] = useState(false);
  const [internalColor, setInternalColor] = useState<OreColor>(() => parseColor(defaultValue) ?? DEFAULT_COLOR);
  const alphaId = useId();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const { ref: popupRef, style: anchoredStyle } = useAnchoredPosition({
    anchorRef: triggerRef,
    placement: 'bottom',
    active: open,
  });

  const parsedValue = useMemo(() => (value === undefined ? null : parseColor(value)), [value]);
  const current = parsedValue ?? internalColor;

  const resolvedPresets = presets ?? ORE_COLOR_PRESETS;
  const parsedPresets = useMemo(() => resolvedPresets.map(parseColor), [resolvedPresets]);

  const currentHex = toHex(current);
  const currentCss = formatColor(current, showAlpha);

  const close = useCallback(() => setOpen(false), []);

  useOverlayBehavior({ open, onClose: close, containerRef: popupRef, modal: false });

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

  // Move focus into the popup once it opens; useOverlayBehavior restores it to the trigger on close.
  useEffect(() => {
    if (open) {
      popupRef.current?.focus();
    }
  }, [open, popupRef]);

  const commit = useCallback(
    (next: OreColor) => {
      if (value === undefined) {
        setInternalColor(next);
      }
      onChange?.(formatColor(next, showAlpha));
    },
    [value, onChange, showAlpha],
  );

  const handlePresetClick = (index: number) => {
    const parsed = parsedPresets[index];
    if (parsed) {
      commit(parsed);
    }
  };

  // The native color input carries no alpha, so the current alpha is preserved.
  const handleNativeColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseColor(event.target.value);
    if (parsed) {
      commit({ ...parsed, a: current.a });
    }
  };

  const handleAlphaChange = (event: ChangeEvent<HTMLInputElement>) => {
    commit({ ...current, a: clampAlpha(Number(event.target.value) / 100) });
  };

  const alphaPercent = Math.round(current.a * 100);

  return (
    <div {...rest} ref={ref} className={cx('ore-color-picker', className)} style={style}>
      <button
        type="button"
        ref={triggerRef}
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="ore-color-picker__trigger"
      >
        <span className="ore-color-picker__swatch" style={{ backgroundColor: currentCss }} aria-hidden="true" />
      </button>

      {open &&
        createPortal(
          <div ref={popupRef} className="ore-color-picker__popup" style={anchoredStyle} tabIndex={-1}>
            <div className="ore-color-picker__grid">
              {resolvedPresets.map((preset, index) => {
                const parsed = parsedPresets[index];
                const selected = parsed != null && toHex(parsed) === currentHex;

                return (
                  <button
                    key={preset}
                    type="button"
                    className={cx('ore-color-picker__preset', { 'ore-color-picker__preset--selected': selected })}
                    style={{ backgroundColor: preset }}
                    aria-label={preset}
                    aria-pressed={selected}
                    onClick={() => handlePresetClick(index)}
                  />
                );
              })}
            </div>

            <button type="button" className="ore-color-picker__custom" onClick={() => colorInputRef.current?.click()}>
              <span className="ore-color-picker__swatch" style={{ backgroundColor: currentCss }} aria-hidden="true" />
              <span className="ore-color-picker__custom-label">{labels.customColor}</span>
              <span className="ore-color-picker__value">{currentCss}</span>
            </button>
            <input
              ref={colorInputRef}
              type="color"
              className="ore-color-picker__native"
              aria-label={labels.customColor}
              tabIndex={-1}
              value={currentHex}
              onChange={handleNativeColorChange}
            />

            {showAlpha && (
              <div className="ore-color-picker__alpha">
                <label className="ore-color-picker__alpha-label" htmlFor={alphaId}>
                  {labels.opacity}
                </label>
                <input
                  id={alphaId}
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={alphaPercent}
                  onChange={handleAlphaChange}
                  className="ore-color-picker__alpha-slider"
                  aria-label={labels.opacity}
                />
                <span className="ore-color-picker__alpha-value">{alphaPercent}%</span>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};
