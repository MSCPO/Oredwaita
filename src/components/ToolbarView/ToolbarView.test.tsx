import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ToolbarView } from './ToolbarView';

describe('<ToolbarView />', () => {
  it('should render top bars, content and bottom bars', () => {
    render(
      <ToolbarView topBars={<div>Top bar</div>} content={<p>Page content</p>} bottomBars={<div>Bottom bar</div>} />,
    );

    expect(screen.getByText('Top bar')).toBeInTheDocument();
    expect(screen.getByText('Page content')).toBeInTheDocument();
    expect(screen.getByText('Bottom bar')).toBeInTheDocument();
  });

  it('should render children as content when no content prop is given', () => {
    render(
      <ToolbarView>
        <p>Children content</p>
      </ToolbarView>,
    );

    expect(screen.getByText('Children content')).toBeInTheDocument();
  });

  it('should render multiple bars per area', () => {
    render(
      <ToolbarView
        topBars={[<div key="one">Bar one</div>, <div key="two">Bar two</div>]}
        content={<p>Page content</p>}
      />,
    );

    expect(screen.getByText('Bar one')).toBeInTheDocument();
    expect(screen.getByText('Bar two')).toBeInTheDocument();
  });

  it('should keep bars mounted but flagged hidden when reveal is false', () => {
    const { container } = render(
      <ToolbarView
        topBars={<div>Top bar</div>}
        bottomBars={<div>Bottom bar</div>}
        content={<p>Page content</p>}
        revealTopBars={false}
        revealBottomBars={false}
      />,
    );

    expect(container.querySelector('.ore-toolbar-view__top-bars')).toHaveClass('ore-toolbar-view__top-bars--hidden');
    expect(container.querySelector('.ore-toolbar-view__bottom-bars')).toHaveClass(
      'ore-toolbar-view__bottom-bars--hidden',
    );
    expect(screen.getByText('Top bar')).toBeInTheDocument();
    expect(screen.getByText('Bottom bar')).toBeInTheDocument();
  });

  it('should not render bar areas when no bars are provided', () => {
    const { container } = render(<ToolbarView content={<p>Page content</p>} />);

    expect(container.querySelector('.ore-toolbar-view__top-bars')).not.toBeInTheDocument();
    expect(container.querySelector('.ore-toolbar-view__bottom-bars')).not.toBeInTheDocument();
  });

  it('should apply the extend classes to the content area', () => {
    const { container } = render(
      <ToolbarView content={<p>Page content</p>} extendContentToTop extendContentToBottom />,
    );

    expect(container.querySelector('.ore-toolbar-view__content')).toHaveClass(
      'ore-toolbar-view__content--extend-top',
      'ore-toolbar-view__content--extend-bottom',
    );
  });

  it('should merge the className', () => {
    const { container } = render(<ToolbarView className="custom-view" content={<p>Page content</p>} />);

    expect(container.firstElementChild).toHaveClass('ore-toolbar-view', 'custom-view');
  });
});
