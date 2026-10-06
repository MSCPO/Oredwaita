import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Bin, Clamp, Squeezer, WrapBox } from './Layout';

describe('<Clamp />', () => {
  it('should apply the medium width token by default', () => {
    const { container } = render(
      <Clamp>
        <span>Content</span>
      </Clamp>,
    );

    const clamp = container.firstElementChild as HTMLElement;
    expect(clamp).toHaveClass('ore-clamp');
    expect(clamp.style.maxWidth).toBe('var(--ore-width-medium)');
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should apply the small width token', () => {
    const { container } = render(<Clamp maximumSize="small">Small</Clamp>);

    expect((container.firstElementChild as HTMLElement).style.maxWidth).toBe('var(--ore-width-small)');
  });

  it('should apply the large width token', () => {
    const { container } = render(<Clamp maximumSize="large">Large</Clamp>);

    expect((container.firstElementChild as HTMLElement).style.maxWidth).toBe('var(--ore-width-large)');
  });

  it('should apply a numeric maximum size in pixels', () => {
    const { container } = render(<Clamp maximumSize={480}>Pinned</Clamp>);

    expect((container.firstElementChild as HTMLElement).style.maxWidth).toBe('480px');
  });

  it('should merge the className', () => {
    const { container } = render(<Clamp className="custom-clamp">Merged</Clamp>);

    expect(container.firstElementChild).toHaveClass('ore-clamp', 'custom-clamp');
  });
});

describe('<Squeezer />', () => {
  it('should render its children', () => {
    render(
      <Squeezer>
        <span>First</span>
        <span>Second</span>
      </Squeezer>,
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('should merge the className', () => {
    const { container } = render(
      <Squeezer className="custom-squeezer">
        <span>First</span>
        <span>Second</span>
      </Squeezer>,
    );

    expect(container.firstElementChild).toHaveClass('ore-squeezer', 'custom-squeezer');
  });
});

describe('<WrapBox />', () => {
  it('should apply a default 8px gap', () => {
    const { container } = render(<WrapBox>Content</WrapBox>);

    const box = container.firstElementChild as HTMLElement;
    expect(box).toHaveClass('ore-wrap-box');
    expect(box.style.gap).toBe('8px');
  });

  it('should apply a custom spacing as gap', () => {
    const { container } = render(<WrapBox spacing={16}>Content</WrapBox>);

    expect((container.firstElementChild as HTMLElement).style.gap).toBe('16px');
  });

  it('should toggle the homogeneous class', () => {
    const { container, rerender } = render(<WrapBox homogeneous>Content</WrapBox>);

    expect(container.firstElementChild).toHaveClass('ore-wrap-box--homogeneous');

    rerender(<WrapBox>Content</WrapBox>);
    expect(container.firstElementChild).not.toHaveClass('ore-wrap-box--homogeneous');
  });

  it('should merge the className', () => {
    const { container } = render(<WrapBox className="custom-box">Content</WrapBox>);

    expect(container.firstElementChild).toHaveClass('ore-wrap-box', 'custom-box');
  });
});

describe('<Bin />', () => {
  it('should render its children', () => {
    render(
      <Bin>
        <button type="button">Binned</button>
      </Bin>,
    );

    expect(screen.getByRole('button', { name: 'Binned' })).toBeInTheDocument();
  });

  it('should merge the className', () => {
    const { container } = render(<Bin className="custom-bin">Content</Bin>);

    expect(container.firstElementChild).toHaveClass('ore-bin', 'custom-bin');
  });
});
