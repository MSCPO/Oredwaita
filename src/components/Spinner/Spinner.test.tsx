import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ThemeProvider } from '../ThemeProvider/ThemeProvider';
import { Spinner } from './Spinner';

describe('<Spinner />', () => {
  it('should render a status indicator with a loading label', () => {
    render(<Spinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('should apply the default size of 24px', () => {
    const { container } = render(<Spinner />);

    const spinner = container.firstElementChild as HTMLElement;
    expect(spinner).toHaveClass('ore-spinner');
    expect(spinner.style.width).toBe('24px');
    expect(spinner.style.height).toBe('24px');
  });

  it('should apply a custom size and merge the className', () => {
    const { container } = render(<Spinner size={48} className="custom-spinner" />);

    const spinner = container.firstElementChild as HTMLElement;
    expect(spinner.style.width).toBe('48px');
    expect(spinner.style.height).toBe('48px');
    expect(spinner).toHaveClass('ore-spinner', 'custom-spinner');
  });

  it('should support a custom loading label', () => {
    render(<Spinner loadingLabel="Please wait" />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Please wait');
  });

  it('should resolve the loading label from the ThemeProvider labels dictionary', () => {
    render(
      <ThemeProvider labels={{ loading: '加载中' }}>
        <Spinner />
      </ThemeProvider>,
    );

    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '加载中');
  });
});
