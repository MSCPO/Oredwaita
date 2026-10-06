import { type FC } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Swipeable, useSwipeTracker } from '../Navigation';

type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface SwipeHarnessProps {
  onSwipeEnd: (direction: SwipeDirection) => void;
}

const SwipeHarness: FC<SwipeHarnessProps> = ({ onSwipeEnd }) => {
  const ref = useSwipeTracker<HTMLDivElement>({ onSwipeEnd });

  return <div ref={ref} data-testid="swipe-target" />;
};

type FakeTouch = { clientX: number; clientY: number };

const touchAt = (clientX: number, clientY: number): FakeTouch => ({ clientX, clientY });

/** jsdom has no TouchEvent constructor; a plain Event with touch list fields is enough for the tracker. */
const dispatchTouch = (
  element: Element,
  type: 'touchstart' | 'touchmove' | 'touchend',
  fingers: { touches?: FakeTouch[]; changedTouches?: FakeTouch[] } = {},
) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'touches', { value: fingers.touches ?? [] });
  Object.defineProperty(event, 'changedTouches', { value: fingers.changedTouches ?? [] });
  element.dispatchEvent(event);
};

describe('<Swipeable />', () => {
  afterEach(() => vi.restoreAllMocks());

  it('should register touch listeners as passive', () => {
    const addEventListenerSpy = vi.spyOn(HTMLDivElement.prototype, 'addEventListener');
    const { container } = render(
      <Swipeable onSwipeRight={vi.fn()} onSwipeLeft={vi.fn()}>
        Content
      </Swipeable>,
    );

    const target = container.querySelector('.ore-swipeable');
    expect(target).not.toBeNull();

    // React also registers delegated listeners on the root container; only count listeners
    // attached to the swipeable element itself (this === target).
    const registrations = addEventListenerSpy.mock.calls
      .map((call, index) => ({
        type: call[0],
        options: call[2],
        thisArg: addEventListenerSpy.mock.contexts[index] as Element,
      }))
      .filter((entry) => entry.thisArg === target);

    expect(registrations.map((entry) => [entry.type, entry.options])).toEqual([
      ['touchstart', { passive: true }],
      ['touchmove', { passive: true }],
      ['touchend', { passive: true }],
    ]);

    addEventListenerSpy.mockRestore();
  });

  it('should call onSwipeRight when swiped right', () => {
    const onSwipeRight = vi.fn();
    const onSwipeLeft = vi.fn();
    const { container } = render(
      <Swipeable onSwipeRight={onSwipeRight} onSwipeLeft={onSwipeLeft}>
        Content
      </Swipeable>,
    );

    const target = container.querySelector('.ore-swipeable') as HTMLElement;
    dispatchTouch(target, 'touchstart', { touches: [touchAt(0, 0)] });
    dispatchTouch(target, 'touchmove', { touches: [touchAt(80, 0)] });
    dispatchTouch(target, 'touchend', { changedTouches: [touchAt(120, 0)] });

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('should call onSwipeLeft when swiped left', () => {
    const onSwipeRight = vi.fn();
    const onSwipeLeft = vi.fn();
    const { container } = render(
      <Swipeable onSwipeRight={onSwipeRight} onSwipeLeft={onSwipeLeft}>
        Content
      </Swipeable>,
    );

    const target = container.querySelector('.ore-swipeable') as HTMLElement;
    dispatchTouch(target, 'touchstart', { touches: [touchAt(0, 0)] });
    dispatchTouch(target, 'touchend', { changedTouches: [touchAt(-120, 0)] });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('should ignore swipes shorter than the threshold', () => {
    const onSwipeRight = vi.fn();
    const onSwipeLeft = vi.fn();
    const { container } = render(
      <Swipeable onSwipeRight={onSwipeRight} onSwipeLeft={onSwipeLeft}>
        Content
      </Swipeable>,
    );

    const target = container.querySelector('.ore-swipeable') as HTMLElement;
    dispatchTouch(target, 'touchstart', { touches: [touchAt(0, 0)] });
    dispatchTouch(target, 'touchend', { changedTouches: [touchAt(30, 0)] });

    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('should report the swipe direction through onSwipeEnd', () => {
    const swipes: Array<[{ x: number; y: number }, SwipeDirection]> = [
      [{ x: 120, y: 0 }, 'right'],
      [{ x: -120, y: 0 }, 'left'],
      [{ x: 0, y: 120 }, 'down'],
      [{ x: 0, y: -120 }, 'up'],
    ];

    for (const [{ x, y }, direction] of swipes) {
      const onSwipeEnd = vi.fn();
      const { unmount } = render(<SwipeHarness onSwipeEnd={onSwipeEnd} />);

      const target = screen.getByTestId('swipe-target');
      dispatchTouch(target, 'touchstart', { touches: [touchAt(0, 0)] });
      dispatchTouch(target, 'touchend', { changedTouches: [touchAt(x, y)] });

      expect(onSwipeEnd).toHaveBeenCalledTimes(1);
      expect(onSwipeEnd).toHaveBeenCalledWith(direction);
      unmount();
    }
  });
});
