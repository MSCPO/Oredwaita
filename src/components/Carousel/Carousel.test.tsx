import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeProvider } from '../ThemeProvider/ThemeProvider';
import { Carousel, CarouselIndicatorDots, CarouselIndicatorLines } from './Carousel';

describe('<Carousel />', () => {
  const user = userEvent.setup();

  it('should render one labelled dot per slide with the first one active', () => {
    render(
      <Carousel>
        <div>Slide one</div>
        <div>Slide two</div>
        <div>Slide three</div>
      </Carousel>,
    );

    expect(screen.getByLabelText('Go to slide 1')).toHaveClass('ore-carousel-dots__dot--active');
    expect(screen.getByLabelText('Go to slide 2')).not.toHaveClass('ore-carousel-dots__dot--active');
    expect(screen.getByLabelText('Go to slide 3')).not.toHaveClass('ore-carousel-dots__dot--active');
  });

  it('should wrap every child in a slide', () => {
    render(
      <Carousel>
        <div>Slide one</div>
        <div>Slide two</div>
      </Carousel>,
    );

    expect(screen.getByText('Slide one').closest('.ore-carousel__slide')).toBeInTheDocument();
    expect(screen.getByText('Slide two').closest('.ore-carousel__slide')).toBeInTheDocument();
  });

  it('should switch to the clicked slide and report the new page', async () => {
    const onPageChanged = vi.fn();
    const { container } = render(
      <Carousel onPageChanged={onPageChanged}>
        <div>Slide one</div>
        <div>Slide two</div>
      </Carousel>,
    );

    await user.click(screen.getByLabelText('Go to slide 2'));

    expect(onPageChanged).toHaveBeenCalledWith(1);
    expect(screen.getByLabelText('Go to slide 2')).toHaveClass('ore-carousel-dots__dot--active');
    expect(screen.getByLabelText('Go to slide 1')).not.toHaveClass('ore-carousel-dots__dot--active');
    const track = container.querySelector<HTMLElement>('.ore-carousel__track');
    expect(track?.style.transform).toBe('translateX(-100%)');
  });

  it('should render the controlled page as active', () => {
    render(
      <Carousel page={1}>
        <div>Slide one</div>
        <div>Slide two</div>
      </Carousel>,
    );

    expect(screen.getByLabelText('Go to slide 2')).toHaveClass('ore-carousel-dots__dot--active');
    expect(screen.getByLabelText('Go to slide 1')).not.toHaveClass('ore-carousel-dots__dot--active');
  });

  it('should not switch slides on its own while controlled', async () => {
    const onPageChanged = vi.fn();
    render(
      <Carousel page={0} onPageChanged={onPageChanged}>
        <div>Slide one</div>
        <div>Slide two</div>
      </Carousel>,
    );

    await user.click(screen.getByLabelText('Go to slide 2'));

    expect(onPageChanged).toHaveBeenCalledWith(1);
    expect(screen.getByLabelText('Go to slide 1')).toHaveClass('ore-carousel-dots__dot--active');
  });

  it('should build indicator labels with the goToSlideLabel callback using 1-based indexes', () => {
    render(
      <Carousel goToSlideLabel={(index) => `第 ${index} 页`}>
        <div>Slide one</div>
        <div>Slide two</div>
      </Carousel>,
    );

    expect(screen.getByLabelText('第 1 页')).toHaveClass('ore-carousel-dots__dot--active');
    expect(screen.getByLabelText('第 2 页')).toBeInTheDocument();
    expect(screen.queryByLabelText('Go to slide 1')).not.toBeInTheDocument();
  });

  it('should resolve indicator labels from the ThemeProvider labels dictionary', () => {
    render(
      <ThemeProvider labels={{ goToSlide: (index) => `转到第 ${index} 张` }}>
        <CarouselIndicatorDots count={2} activePage={0} onSelect={vi.fn()} />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText('转到第 1 张')).toBeInTheDocument();
    expect(screen.getByLabelText('转到第 2 张')).toBeInTheDocument();
  });
});

describe('<CarouselIndicatorDots />', () => {
  const user = userEvent.setup();

  it('should call onSelect with the index of the clicked dot', async () => {
    const onSelect = vi.fn();
    render(<CarouselIndicatorDots count={3} activePage={1} onSelect={onSelect} />);

    await user.click(screen.getByLabelText('Go to slide 3'));

    expect(onSelect).toHaveBeenCalledWith(2);
    expect(screen.getByLabelText('Go to slide 2')).toHaveClass('ore-carousel-dots__dot--active');
  });

  it('should label every dot accessibly', () => {
    render(<CarouselIndicatorDots count={2} activePage={0} onSelect={vi.fn()} />);

    expect(screen.getByLabelText('Go to slide 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to slide 2')).toBeInTheDocument();
  });
});

describe('<CarouselIndicatorLines />', () => {
  const user = userEvent.setup();

  it('should call onSelect with the index of the clicked line', async () => {
    const onSelect = vi.fn();
    render(<CarouselIndicatorLines count={3} activePage={2} onSelect={onSelect} />);

    await user.click(screen.getByLabelText('Go to slide 1'));

    expect(onSelect).toHaveBeenCalledWith(0);
    // The active line is driven by the activePage prop, so it stays on slide 3 until the parent updates it.
    expect(screen.getByLabelText('Go to slide 3')).toHaveClass('ore-carousel-lines__line--active');
    expect(screen.getByLabelText('Go to slide 1')).not.toHaveClass('ore-carousel-lines__line--active');
  });

  it('should mark the active page line', () => {
    render(<CarouselIndicatorLines count={2} activePage={1} onSelect={vi.fn()} />);

    expect(screen.getByLabelText('Go to slide 2')).toHaveClass('ore-carousel-lines__line--active');
    expect(screen.getByLabelText('Go to slide 1')).not.toHaveClass('ore-carousel-lines__line--active');
  });
});
