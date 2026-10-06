import { type FC, useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  ORE_DEFAULT_LABELS,
  type OreColorScheme,
  type OreLabels,
  type OreLabelsInput,
  ThemeProvider,
  useOreLabels,
  useOreTheme,
} from './ThemeProvider';
import { Dialog } from '../Dialog';
import { TabBar } from '../Tabs';

type ChangeListener = (event: MediaQueryListEvent) => void;

interface MatchMediaMock {
  dispatchChange: (matches: boolean) => void;
}

/**
 * jsdom 27 does not implement window.matchMedia, so every test installs a
 * controllable fake whose matches flag can be flipped at runtime.
 */
const setupMatchMedia = (initialMatches: boolean): MatchMediaMock => {
  const listeners = new Set<ChangeListener>();
  const mql = {
    matches: initialMatches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: (_type: string, listener: ChangeListener) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: ChangeListener) => {
      listeners.delete(listener);
    },
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mql as MediaQueryList),
  );

  return {
    dispatchChange: (matches: boolean) => {
      mql.matches = matches;
      listeners.forEach((listener) => listener({ matches } as MediaQueryListEvent));
    },
  };
};

const ThemeConsumer: FC = () => {
  const { colorScheme, setColorScheme, isDark } = useOreTheme();

  return (
    <div>
      <span data-testid="scheme">scheme:{colorScheme}</span>
      <span data-testid="is-dark">isDark:{String(isDark)}</span>
      <button type="button" onClick={() => setColorScheme('dark')}>
        Set dark scheme
      </button>
      <button type="button" onClick={() => setColorScheme('light')}>
        Set light scheme
      </button>
    </div>
  );
};

const InvalidHarness: FC = () => {
  useOreTheme();

  return null;
};

const renderTheme = (scheme?: OreColorScheme, matches = false): MatchMediaMock => {
  const mock = setupMatchMedia(matches);
  render(
    <ThemeProvider defaultColorScheme={scheme}>
      <ThemeConsumer />
    </ThemeProvider>,
  );

  return mock;
};

const ACCENT_PROPERTIES = [
  '--ore-accent-color',
  '--ore-accent-bg-color',
  '--ore-accent-fg-color',
  '--ore-accent-hover',
];

const removeAccentProperties = (): void => {
  ACCENT_PROPERTIES.forEach((property) => document.documentElement.style.removeProperty(property));
};

interface LabelsProbeProps {
  onLabels?: (labels: OreLabels) => void;
}

const LabelsProbe: FC<LabelsProbeProps> = ({ onLabels }) => {
  const labels = useOreLabels();

  useEffect(() => {
    onLabels?.(labels);
  }, [labels, onLabels]);

  return (
    <div>
      <span data-testid="label-close">{labels.close}</span>
      <span data-testid="label-close-tab">{labels.closeTab('Inbox')}</span>
      <span data-testid="label-go-to-slide">{labels.goToSlide(2)}</span>
    </div>
  );
};

interface RenderProvidersOptions {
  labels?: OreLabelsInput;
  accentColor?: string;
  onLabels?: (labels: OreLabels) => void;
}

const renderProviders = ({ labels, accentColor, onLabels }: RenderProvidersOptions = {}) => {
  setupMatchMedia(false);

  return render(
    <ThemeProvider accentColor={accentColor} defaultColorScheme="system" labels={labels}>
      <LabelsProbe onLabels={onLabels} />
    </ThemeProvider>,
  );
};

describe('<ThemeProvider />', () => {
  const user = userEvent.setup();

  const removeThemeClasses = (): void => {
    document.documentElement.classList.remove('ore-theme-light', 'ore-theme-dark');
  };

  beforeEach(() => {
    removeThemeClasses();
    removeAccentProperties();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    removeThemeClasses();
    removeAccentProperties();
  });

  it('should throw when useOreTheme is used without a provider', () => {
    expect(() => render(<InvalidHarness />)).toThrow('useOreTheme must be used within a ThemeProvider');
  });

  it('should apply the light theme class for the light scheme, even if the system prefers dark', () => {
    renderTheme('light', true);

    expect(document.documentElement).toHaveClass('ore-theme-light');
    expect(document.documentElement).not.toHaveClass('ore-theme-dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('isDark:false');
    expect(screen.getByTestId('scheme')).toHaveTextContent('scheme:light');
  });

  it('should apply the dark theme class for the dark scheme', () => {
    renderTheme('dark', false);

    expect(document.documentElement).toHaveClass('ore-theme-dark');
    expect(document.documentElement).not.toHaveClass('ore-theme-light');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('isDark:true');
  });

  it('should not force a theme class for the system scheme', () => {
    renderTheme('system', false);

    expect(document.documentElement).not.toHaveClass('ore-theme-light');
    expect(document.documentElement).not.toHaveClass('ore-theme-dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('isDark:false');
  });

  it('should resolve the system scheme as dark when the media query matches', () => {
    renderTheme('system', true);

    expect(screen.getByTestId('is-dark')).toHaveTextContent('isDark:true');
    expect(document.documentElement).not.toHaveClass('ore-theme-light');
  });

  it('should render children with a light system preference from the media query', () => {
    renderTheme('system', false);

    expect(screen.getByTestId('scheme')).toHaveTextContent('scheme:system');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('isDark:false');
  });

  it('should react to system scheme change events', () => {
    const mock = renderTheme('system', false);

    act(() => {
      mock.dispatchChange(true);
    });
    expect(screen.getByTestId('is-dark')).toHaveTextContent('isDark:true');

    act(() => {
      mock.dispatchChange(false);
    });
    expect(screen.getByTestId('is-dark')).toHaveTextContent('isDark:false');
  });

  it('should update the theme when the scheme changes at runtime', async () => {
    renderTheme('light', false);

    await user.click(screen.getByRole('button', { name: 'Set dark scheme' }));

    expect(document.documentElement).toHaveClass('ore-theme-dark');
    expect(document.documentElement).not.toHaveClass('ore-theme-light');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('isDark:true');
  });

  it('should default to the system scheme', () => {
    renderTheme(undefined, false);

    expect(screen.getByTestId('scheme')).toHaveTextContent('scheme:system');
  });

  describe('labels', () => {
    it('should provide the built-in English defaults when no labels are passed', () => {
      const onLabels = vi.fn();
      renderProviders({ onLabels });

      expect(onLabels).toHaveBeenCalledWith(ORE_DEFAULT_LABELS);
      expect(screen.getByTestId('label-close')).toHaveTextContent('Close');
      expect(screen.getByTestId('label-close-tab')).toHaveTextContent('Close tab Inbox');
      expect(screen.getByTestId('label-go-to-slide')).toHaveTextContent('Go to slide 2');
    });

    it('should merge partial label overrides on top of the defaults', () => {
      renderProviders({
        labels: {
          close: 'Dismiss',
          closeTab: (title) => `Shut down ${title}`,
        },
      });

      expect(screen.getByTestId('label-close')).toHaveTextContent('Dismiss');
      expect(screen.getByTestId('label-close-tab')).toHaveTextContent('Shut down Inbox');
      expect(screen.getByTestId('label-go-to-slide')).toHaveTextContent('Go to slide 2');
    });

    it('should return the defaults without throwing when useOreLabels is used outside a provider', () => {
      expect(() => render(<LabelsProbe />)).not.toThrow();

      expect(screen.getByTestId('label-close')).toHaveTextContent('Close');
      expect(screen.getByTestId('label-close-tab')).toHaveTextContent('Close tab Inbox');
      expect(screen.getByTestId('label-go-to-slide')).toHaveTextContent('Go to slide 2');
    });

    it('should flow the labels dictionary through to component aria-labels', () => {
      render(
        <ThemeProvider labels={{ close: '关闭', newTab: '新建标签页' }}>
          <Dialog open onClose={vi.fn()} title="示例对话框">
            <p>内容</p>
          </Dialog>
          <TabBar tabs={[{ id: 'home', title: '主页' }]} onNewTab={() => {}} />
        </ThemeProvider>,
      );

      expect(screen.getByRole('dialog', { name: '示例对话框' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '新建标签页' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'New tab' })).not.toBeInTheDocument();
    });

    it('should prefer an explicit component label over the labels dictionary', () => {
      render(
        <ThemeProvider labels={{ close: '关闭' }}>
          <Dialog open onClose={vi.fn()} title="示例" closeLabel="Dismiss">
            <p>内容</p>
          </Dialog>
        </ThemeProvider>,
      );

      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '关闭' })).not.toBeInTheDocument();
    });
  });

  describe('accentColor', () => {
    it('should write the accent CSS custom properties to the document root', () => {
      renderProviders({ accentColor: '#ff0000' });

      const rootStyle = document.documentElement.style;
      expect(rootStyle.getPropertyValue('--ore-accent-color')).toBe('#ff0000');
      expect(rootStyle.getPropertyValue('--ore-accent-bg-color')).not.toBe('');
      expect(rootStyle.getPropertyValue('--ore-accent-fg-color')).not.toBe('');
      expect(rootStyle.getPropertyValue('--ore-accent-hover')).not.toBe('');
    });

    it('should update the accent CSS custom properties when accentColor changes', () => {
      const { rerender } = renderProviders({ accentColor: '#ff0000' });

      rerender(
        <ThemeProvider accentColor="#00ff00" defaultColorScheme="system">
          <LabelsProbe />
        </ThemeProvider>,
      );

      expect(document.documentElement.style.getPropertyValue('--ore-accent-color')).toBe('#00ff00');
    });

    it('should remove the accent CSS custom properties when accentColor becomes undefined', () => {
      const { rerender } = renderProviders({ accentColor: '#ff0000' });

      rerender(
        <ThemeProvider defaultColorScheme="system">
          <LabelsProbe />
        </ThemeProvider>,
      );

      const rootStyle = document.documentElement.style;
      ACCENT_PROPERTIES.forEach((property) => expect(rootStyle.getPropertyValue(property)).toBe(''));
    });

    it('should remove the accent CSS custom properties on unmount', () => {
      const { unmount } = renderProviders({ accentColor: '#ff0000' });
      unmount();

      const rootStyle = document.documentElement.style;
      ACCENT_PROPERTIES.forEach((property) => expect(rootStyle.getPropertyValue(property)).toBe(''));
    });

    it('should not write accent CSS custom properties when accentColor is not provided', () => {
      renderProviders();

      const rootStyle = document.documentElement.style;
      ACCENT_PROPERTIES.forEach((property) => expect(rootStyle.getPropertyValue(property)).toBe(''));
    });
  });
});
