/* eslint-disable react-refresh/only-export-components */
import { createContext, type FC, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type OreColorScheme = 'system' | 'light' | 'dark';

interface ThemeContextType {
  colorScheme: OreColorScheme;
  setColorScheme: (scheme: OreColorScheme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * User-facing labels rendered by OreDwaita components. Every key is required,
 * so a complete label set is always available through `useOreLabels`.
 */
export interface OreLabels {
  close: string;
  minimize: string;
  maximize: string;
  back: string;
  newTab: string;
  closeTab: (title: string) => string;
  closeOverview: string;
  tabsOverview: string;
  keyboardShortcuts: string;
  website: string;
  developedBy: (name: string) => string;
  apply: string;
  preferences: string;
  searchPreferences: string;
  searchPlaceholder: string;
  clearSearch: string;
  noResults: string;
  loading: string;
  moreOptions: string;
  expandRow: string;
  collapseRow: string;
  expand: string;
  collapse: string;
  showPassword: string;
  hidePassword: string;
  decrease: string;
  increase: string;
  resize: string;
  previousMonth: string;
  nextMonth: string;
  today: string;
  pickDate: string;
  customColor: string;
  opacity: string;
  goToSlide: (index: number) => string;
}

/** Partial label overrides; every omitted key falls back to the built-in default. */
export type OreLabelsInput = { [K in keyof OreLabels]?: OreLabels[K] };

/** Built-in English defaults used when no labels are provided. */
export const ORE_DEFAULT_LABELS: OreLabels = {
  close: 'Close',
  minimize: 'Minimize',
  maximize: 'Maximize',
  back: 'Go back',
  newTab: 'New tab',
  closeTab: (title) => `Close tab ${title}`,
  closeOverview: 'Close overview',
  tabsOverview: 'Tabs Overview',
  keyboardShortcuts: 'Keyboard Shortcuts',
  website: 'Website',
  developedBy: (name) => `Developed by ${name}`,
  apply: 'Apply',
  preferences: 'Preferences',
  searchPreferences: 'Search preferences...',
  searchPlaceholder: 'Search...',
  clearSearch: 'Clear search',
  noResults: 'No results found',
  loading: 'Loading',
  moreOptions: 'More options',
  expandRow: 'Expand row',
  collapseRow: 'Collapse row',
  expand: 'Expand',
  collapse: 'Collapse',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  decrease: 'Decrease',
  increase: 'Increase',
  resize: 'Resize',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  today: 'Today',
  pickDate: 'Pick a date',
  customColor: 'Custom color',
  opacity: 'Opacity',
  goToSlide: (index) => `Go to slide ${index}`,
};

const LabelsContext = createContext<OreLabels>(ORE_DEFAULT_LABELS);

/** Accent CSS custom properties written to `document.documentElement` by the `accentColor` prop. */
const ACCENT_CSS_PROPERTIES = [
  '--ore-accent-color',
  '--ore-accent-bg-color',
  '--ore-accent-fg-color',
  '--ore-accent-hover',
] as const;

export interface ThemeProviderProps {
  children: ReactNode;
  defaultColorScheme?: OreColorScheme;
  /** Partial label overrides merged on top of the built-in English labels. */
  labels?: OreLabelsInput;
  /** Accent color written to the root element as `--ore-accent-*` custom properties. */
  accentColor?: string;
}

export const ThemeProvider: FC<ThemeProviderProps> = ({
  children,
  defaultColorScheme = 'system',
  labels,
  accentColor,
}) => {
  const [colorScheme, setColorScheme] = useState<OreColorScheme>(defaultColorScheme);
  const [isDark, setIsDark] = useState<boolean>(
    () => typeof window !== 'undefined' && (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false),
  );

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      root.classList.remove('ore-theme-light', 'ore-theme-dark');
      const activeDark = colorScheme === 'dark' || (colorScheme === 'system' && mediaQuery.matches);
      setIsDark(activeDark);
      if (colorScheme === 'light') {
        root.classList.add('ore-theme-light');
      } else if (colorScheme === 'dark') {
        root.classList.add('ore-theme-dark');
      }
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [colorScheme]);

  useEffect(() => {
    if (!accentColor) {
      return;
    }

    const root = document.documentElement;
    root.style.setProperty('--ore-accent-color', accentColor);
    root.style.setProperty('--ore-accent-bg-color', `color-mix(in srgb, ${accentColor} 75%, white)`);
    root.style.setProperty('--ore-accent-fg-color', '#ffffff');
    root.style.setProperty('--ore-accent-hover', `color-mix(in srgb, ${accentColor} 85%, black)`);

    return () => {
      ACCENT_CSS_PROPERTIES.forEach((property) => root.style.removeProperty(property));
    };
  }, [accentColor]);

  const contextValue = useMemo(() => ({ colorScheme, setColorScheme, isDark }), [colorScheme, isDark]);
  const labelsValue = useMemo<OreLabels>(() => ({ ...ORE_DEFAULT_LABELS, ...labels }), [labels]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <LabelsContext.Provider value={labelsValue}>{children}</LabelsContext.Provider>
    </ThemeContext.Provider>
  );
};

export const useOreTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useOreTheme must be used within a ThemeProvider');
  }

  return context;
};

/**
 * Returns the merged label set. Unlike `useOreTheme` this hook never throws:
 * outside of a provider it yields the built-in English defaults.
 */
export const useOreLabels = (): OreLabels => useContext(LabelsContext);
