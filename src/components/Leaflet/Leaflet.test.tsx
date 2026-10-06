import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import { Leaflet, LeafletPage } from './Leaflet';

/**
 * Controllable ResizeObserver replacement so fold behavior can be simulated
 * deterministically in jsdom.
 */
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];

  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }

  observe = vi.fn();

  unobserve = vi.fn();

  disconnect = vi.fn();

  trigger(width: number): void {
    const entry = { contentRect: { width } } as unknown as ResizeObserverEntry;

    this.callback([entry], this as unknown as ResizeObserver);
  }
}

beforeEach(() => {
  FakeResizeObserver.instances = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('<Leaflet />', () => {
  it('should render all pages', () => {
    render(
      <Leaflet>
        <LeafletPage id="inbox">Inbox content</LeafletPage>
        <LeafletPage id="detail">Detail content</LeafletPage>
      </Leaflet>,
    );

    expect(screen.getByText('Inbox content')).toBeInTheDocument();
    expect(screen.getByText('Detail content')).toBeInTheDocument();
  });

  it('should start unfolded with every page visible and the slide transition', () => {
    const { container } = render(
      <Leaflet>
        <LeafletPage id="inbox">Inbox content</LeafletPage>
        <LeafletPage id="detail">Detail content</LeafletPage>
      </Leaflet>,
    );

    expect(container.firstElementChild).toHaveClass(
      'ore-leaflet',
      'ore-leaflet--unfolded',
      'ore-leaflet--transition-slide',
    );

    const wrappers = container.querySelectorAll('.ore-leaflet-page-wrapper');
    expect(wrappers).toHaveLength(2);
    expect(wrappers[0]).toHaveClass('ore-leaflet-page--visible');
    expect(wrappers[1]).toHaveClass('ore-leaflet-page--visible');
  });

  it('should apply the configured transition class', () => {
    const { container } = render(
      <Leaflet transitionType="over">
        <LeafletPage id="inbox">Inbox content</LeafletPage>
      </Leaflet>,
    );

    expect(container.firstElementChild).toHaveClass('ore-leaflet--transition-over');
  });

  it('should hide pages before the active one when folded with visiblePageId', () => {
    const { container } = render(
      <Leaflet folded visiblePageId="detail">
        <LeafletPage id="inbox">Inbox content</LeafletPage>
        <LeafletPage id="detail">Detail content</LeafletPage>
      </Leaflet>,
    );

    expect(container.firstElementChild).toHaveClass('ore-leaflet--folded');

    const wrappers = container.querySelectorAll('.ore-leaflet-page-wrapper');
    expect(wrappers[0]).toHaveClass('ore-leaflet-page--hidden-left');
    expect(wrappers[0]).not.toHaveClass('ore-leaflet-page--visible');
    expect(wrappers[1]).toHaveClass('ore-leaflet-page--visible');
    expect(screen.getByText('Detail content')).toBeInTheDocument();
  });

  it('should default the active page to the first one when folded', () => {
    const { container } = render(
      <Leaflet folded>
        <LeafletPage id="inbox">Inbox content</LeafletPage>
        <LeafletPage id="detail">Detail content</LeafletPage>
      </Leaflet>,
    );

    const wrappers = container.querySelectorAll('.ore-leaflet-page-wrapper');
    expect(wrappers[0]).toHaveClass('ore-leaflet-page--visible');
    expect(wrappers[1]).toHaveClass('ore-leaflet-page--hidden-right');
    expect(wrappers[1]).not.toHaveClass('ore-leaflet-page--visible');
  });

  it('should fold and unfold based on ResizeObserver widths', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const { container } = render(
      <Leaflet>
        <LeafletPage id="inbox">Inbox content</LeafletPage>
      </Leaflet>,
    );

    const observer = FakeResizeObserver.instances.at(-1);
    expect(observer).toBeDefined();

    act(() => observer?.trigger(100));
    expect(container.firstElementChild).toHaveClass('ore-leaflet--folded');

    act(() => observer?.trigger(800));
    expect(container.firstElementChild).toHaveClass('ore-leaflet--unfolded');
  });

  it('should honor a custom foldThreshold', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const { container } = render(
      <Leaflet foldThreshold={50}>
        <LeafletPage id="inbox">Inbox content</LeafletPage>
      </Leaflet>,
    );

    const observer = FakeResizeObserver.instances.at(-1);
    act(() => observer?.trigger(100));

    expect(container.firstElementChild).toHaveClass('ore-leaflet--unfolded');
  });

  it('should ignore resizing while folded is controlled', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const { container } = render(
      <Leaflet folded={false}>
        <LeafletPage id="inbox">Inbox content</LeafletPage>
      </Leaflet>,
    );

    expect(container.firstElementChild).toHaveClass('ore-leaflet--unfolded');
    expect(FakeResizeObserver.instances).toHaveLength(0);
  });

  it('should merge the className', () => {
    const { container } = render(
      <Leaflet className="custom-leaflet">
        <LeafletPage id="inbox">Inbox content</LeafletPage>
      </Leaflet>,
    );

    expect(container.firstElementChild).toHaveClass('ore-leaflet', 'custom-leaflet');
  });
});

describe('<LeafletPage />', () => {
  it('should render its content and merge the className', () => {
    const { container } = render(
      <LeafletPage id="about" className="custom-page">
        <p>About body</p>
      </LeafletPage>,
    );

    expect(container.firstElementChild).toHaveClass('ore-leaflet-page', 'custom-page');
    expect(screen.getByText('About body')).toBeInTheDocument();
  });
});
