import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { Avatar } from '../Avatar';

describe('<Avatar />', () => {
  it('should fall back to blue for empty text', () => {
    const { container } = render(<Avatar />);

    expect(container.firstChild).toHaveClass('ore-avatar--blue');
  });

  it('should derive the color class from the text hash', () => {
    // hash of "A" (charCode 65) maps to the third entry of the color list: yellow
    const { container } = render(<Avatar text="A" />);

    expect(container.firstChild).toHaveClass('ore-avatar--yellow');
  });

  it('should honor the color prop over the hash', () => {
    const { container } = render(<Avatar text="A" color="blue" />);

    expect(container.firstChild).toHaveClass('ore-avatar--blue');
  });
});
