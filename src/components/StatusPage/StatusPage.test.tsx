import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { StatusPage } from './StatusPage';

describe('<StatusPage />', () => {
  it('should render the title as a level-2 heading', () => {
    render(<StatusPage title="No connection" />);

    expect(screen.getByRole('heading', { level: 2, name: 'No connection' })).toHaveClass('ore-status-page__title');
  });

  it('should render the icon when provided', () => {
    render(
      <StatusPage
        title="Offline"
        icon={
          <svg data-testid="status-icon">
            <circle cx="5" cy="5" r="4" />
          </svg>
        }
      />,
    );

    expect(screen.getByTestId('status-icon').parentElement).toHaveClass('ore-status-page__icon');
  });

  it('should not render the icon container without an icon', () => {
    const { container } = render(<StatusPage title="Offline" />);

    expect(container.querySelector('.ore-status-page__icon')).not.toBeInTheDocument();
  });

  it('should render the description when provided', () => {
    render(<StatusPage title="Offline" description="Check your network settings" />);

    expect(screen.getByText('Check your network settings')).toHaveClass('ore-status-page__description');
  });

  it('should not render a description without one', () => {
    const { container } = render(<StatusPage title="Offline" />);

    expect(container.querySelector('.ore-status-page__description')).not.toBeInTheDocument();
  });

  it('should render children actions when provided', () => {
    render(
      <StatusPage title="Something went wrong">
        <button type="button">Retry</button>
      </StatusPage>,
    );

    expect(screen.getByRole('button', { name: 'Retry' }).parentElement).toHaveClass('ore-status-page__child');
  });

  it('should forward rest props to the root element', () => {
    render(<StatusPage title="Offline" data-testid="status-page-root" />);

    expect(screen.getByTestId('status-page-root')).toHaveClass('ore-status-page');
  });

  it('should apply a custom className', () => {
    const { container } = render(<StatusPage title="Offline" className="custom-status" />);

    expect(container.firstElementChild).toHaveClass('ore-status-page', 'custom-status');
  });
});
