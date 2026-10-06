import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button, ButtonContent } from './Button';

describe('<Button />', () => {
  const user = userEvent.setup();

  it('should render children and handle click', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click Me</Button>);

    const btn = screen.getByRole('button', { name: 'Click Me' });
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should render suggested action variant', () => {
    render(<Button variant="suggested">Suggested</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('ore-button--suggested');
  });

  it('should render ButtonContent badge', () => {
    render(
      <Button>
        <ButtonContent label="Mail" badge="5" />
      </Button>,
    );
    expect(screen.getByText('Mail')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
