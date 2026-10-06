import { describe, expect, it, vi } from 'vitest';
import { createRef, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Card, CardBody, CardFooter, CardHeader } from '../Card';

const iconStub: ReactNode = <span data-testid="card-icon">icon</span>;

describe('<Card />', () => {
  const user = userEvent.setup();

  it('should render its children inside the card root', () => {
    render(
      <Card data-testid="card">
        <p>Grouped content</p>
      </Card>,
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('ore-card');
    expect(card).toHaveTextContent('Grouped content');
  });

  it('should apply the interactive modifier class only when interactive', () => {
    const { rerender } = render(<Card data-testid="card" />);

    expect(screen.getByTestId('card')).not.toHaveClass('ore-card--interactive');

    rerender(<Card data-testid="card" interactive />);
    expect(screen.getByTestId('card')).toHaveClass('ore-card--interactive');
  });

  it('should invoke onClick on an interactive card', async () => {
    const onClick = vi.fn();
    render(
      <Card interactive onClick={onClick} data-testid="card">
        Open settings
      </Card>,
    );

    await user.click(screen.getByTestId('card'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should merge a custom className with the base class and modifier', () => {
    render(<Card interactive className="my-extra" data-testid="card" />);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('ore-card');
    expect(card).toHaveClass('ore-card--interactive');
    expect(card).toHaveClass('my-extra');
  });

  it('should forward rest props and style to the root element', () => {
    render(<Card data-testid="card" data-analytics="card-1" style={{ color: 'rgb(255, 0, 0)' }} />);

    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-analytics', 'card-1');
    expect(card).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('should forward the ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref} data-testid="card" />);

    expect(ref.current).toBe(screen.getByTestId('card'));
  });
});

describe('<CardHeader />', () => {
  it('should render title, subtitle, icon and actions', () => {
    render(
      <CardHeader
        title="General"
        subtitle="System preferences"
        icon={iconStub}
        actions={<button type="button">Edit</button>}
      />,
    );

    expect(screen.getByText('General')).toHaveClass('ore-card__title');
    expect(screen.getByText('System preferences')).toHaveClass('ore-card__subtitle');
    expect(screen.getByTestId('card-icon').parentElement).toHaveClass('ore-card__icon');
    expect(screen.getByRole('button', { name: 'Edit' }).parentElement).toHaveClass('ore-card__actions');
  });

  it('should not render title, subtitle, icon or actions when absent', () => {
    const { container } = render(<CardHeader />);

    expect(container.querySelector('.ore-card__title')).toBeNull();
    expect(container.querySelector('.ore-card__subtitle')).toBeNull();
    expect(container.querySelector('.ore-card__icon')).toBeNull();
    expect(container.querySelector('.ore-card__actions')).toBeNull();
  });

  it('should merge a custom className and forward rest props', () => {
    render(<CardHeader title="General" className="my-header" data-testid="header" />);

    const header = screen.getByTestId('header');
    expect(header).toHaveClass('ore-card__header');
    expect(header).toHaveClass('my-header');
    expect(header).toHaveTextContent('General');
  });
});

describe('<CardBody />', () => {
  it('should merge a custom className and forward rest props and style', () => {
    render(
      <CardBody className="my-body" data-testid="body" data-slot="body" style={{ color: 'rgb(0, 0, 255)' }}>
        Body content
      </CardBody>,
    );

    const body = screen.getByTestId('body');
    expect(body).toHaveClass('ore-card__body');
    expect(body).toHaveClass('my-body');
    expect(body).toHaveAttribute('data-slot', 'body');
    expect(body).toHaveStyle({ color: 'rgb(0, 0, 255)' });
    expect(body).toHaveTextContent('Body content');
  });
});

describe('<CardFooter />', () => {
  it('should merge a custom className and forward rest props and style', () => {
    render(
      <CardFooter className="my-footer" data-testid="footer" data-slot="footer" style={{ color: 'rgb(0, 128, 0)' }}>
        Footer content
      </CardFooter>,
    );

    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('ore-card__footer');
    expect(footer).toHaveClass('my-footer');
    expect(footer).toHaveAttribute('data-slot', 'footer');
    expect(footer).toHaveStyle({ color: 'rgb(0, 128, 0)' });
    expect(footer).toHaveTextContent('Footer content');
  });
});

describe('<Card /> composition', () => {
  it('should compose header, body and footer inside one card', () => {
    render(
      <Card data-testid="card">
        <CardHeader title="Appearance" subtitle="Light and dark" icon={iconStub} actions={<span>actions</span>} />
        <CardBody>Select the interface style.</CardBody>
        <CardFooter>Reset to default</CardFooter>
      </Card>,
    );

    const card = screen.getByTestId('card');
    expect(card.querySelector('.ore-card__header')).not.toBeNull();
    expect(card.querySelector('.ore-card__body')).not.toBeNull();
    expect(card.querySelector('.ore-card__footer')).not.toBeNull();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Select the interface style.')).toBeInTheDocument();
    expect(screen.getByText('Reset to default')).toBeInTheDocument();
  });
});
