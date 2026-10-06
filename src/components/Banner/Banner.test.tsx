import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '../Button/Button';
import { Banner } from './Banner';

describe('<Banner />', () => {
  const user = userEvent.setup();

  it('should render the title', () => {
    render(<Banner title="Heads up" />);

    expect(screen.getByText('Heads up')).toHaveClass('ore-banner__title');
  });

  it('should render nothing when not revealed', () => {
    const { container } = render(<Banner title="Heads up" revealed={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render custom actions and handle clicks', async () => {
    const onRestart = vi.fn();
    render(<Banner title="Update available" actions={<Button onClick={onRestart}>Restart</Button>} />);

    await user.click(screen.getByRole('button', { name: 'Restart' }));

    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it('should not render a button without actions', () => {
    render(<Banner title="Heads up" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render the icon before the title', () => {
    render(<Banner title="Heads up" icon={<span data-testid="banner-icon" />} />);

    const iconWrapper = screen.getByTestId('banner-icon').parentElement;
    expect(iconWrapper).toHaveClass('ore-banner__icon');
    expect(iconWrapper?.nextElementSibling).toHaveClass('ore-banner__title');
  });

  it('should forward rest props to the root element', () => {
    render(<Banner title="Heads up" data-testid="banner-root" />);

    expect(screen.getByTestId('banner-root')).toHaveClass('ore-banner');
  });

  it('should forward style to the root element', () => {
    const { container } = render(<Banner title="Heads up" style={{ backgroundColor: 'rgb(1, 2, 3)' }} />);

    expect(container.firstElementChild).toHaveStyle({ backgroundColor: 'rgb(1, 2, 3)' });
  });

  it('should apply a custom className', () => {
    const { container } = render(<Banner title="Heads up" className="custom-banner" />);

    expect(container.firstElementChild).toHaveClass('ore-banner', 'custom-banner');
  });
});
