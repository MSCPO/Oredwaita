import type { Preview } from '@storybook/react-vite';
import './preview.scss';
import '../src/styles/oredwaita.scss';

/* Brand canvas: story canvas follows the theme like an app window would.
 * No global ThemeProvider here — stories that demo theming mount their own;
 * the rest follow the OS preference. */
if (typeof document !== 'undefined') {
  const canvas = document.createElement('style');
  canvas.textContent =
    'body { margin: 0; background: var(--ore-window-bg-color); color: var(--ore-window-fg-color); }';
  document.head.appendChild(canvas);
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
