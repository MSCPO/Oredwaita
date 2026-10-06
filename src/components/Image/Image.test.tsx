import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Image } from '../Image';

describe('<Image />', () => {
  const alt = 'Sample illustration';

  it('should apply the contain fit class by default', () => {
    render(<Image src="sample.png" alt={alt} />);

    const image = screen.getByRole('img', { name: alt });
    expect(image).toHaveClass('ore-image');
    expect(image).toHaveClass('ore-image--fit-contain');
  });

  it('should apply a modifier class for each content fit', () => {
    const { rerender } = render(<Image src="sample.png" alt={alt} fit="cover" />);

    expect(screen.getByRole('img', { name: alt })).toHaveClass('ore-image--fit-cover');

    rerender(<Image src="sample.png" alt={alt} fit="fill" />);
    expect(screen.getByRole('img', { name: alt })).toHaveClass('ore-image--fit-fill');

    rerender(<Image src="sample.png" alt={alt} fit="scale-down" />);
    expect(screen.getByRole('img', { name: alt })).toHaveClass('ore-image--fit-scale-down');
  });

  it('should apply the rounded modifier class', () => {
    render(<Image src="sample.png" alt={alt} rounded />);

    expect(screen.getByRole('img', { name: alt })).toHaveClass('ore-image--rounded');
  });

  it('should keep the image accessible via its alt text', () => {
    render(<Image src="sample.png" alt={alt} />);

    expect(screen.getByRole('img', { name: alt })).toBeInTheDocument();
  });

  it('should merge a custom className with the block class', () => {
    render(<Image src="sample.png" alt={alt} className="photo" />);

    const image = screen.getByRole('img', { name: alt });
    expect(image).toHaveClass('ore-image');
    expect(image).toHaveClass('photo');
  });

  it('should forward extra props to the root element', () => {
    render(<Image src="sample.png" alt={alt} data-testid="hero-image" data-section="header" />);

    const image = screen.getByTestId('hero-image');
    expect(image).toHaveAttribute('data-section', 'header');
  });

  it('should forward src to the root element', () => {
    render(<Image src="https://example.com/picture.svg" alt={alt} />);

    expect(screen.getByRole('img', { name: alt })).toHaveAttribute('src', 'https://example.com/picture.svg');
  });

  it('should forward style to the root element', () => {
    render(<Image src="sample.png" alt={alt} data-testid="styled-image" style={{ color: 'rgb(255, 0, 0)' }} />);

    expect(screen.getByTestId('styled-image')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
