import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';

import { Tooltip } from './Tooltip';

describe('<Tooltip />', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('should open after the hover delay and close on leave', () => {
    render(
      <Tooltip content="Helper text">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseOver(trigger);
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole('tooltip')).toHaveTextContent('Helper text');

    fireEvent.mouseOut(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should cancel the pending open when the pointer leaves early', () => {
    render(
      <Tooltip content="Helper text">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.mouseOver(trigger);
    fireEvent.mouseOut(trigger);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should open on focus and close on blur', () => {
    render(
      <Tooltip content="Helper text">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.focus(trigger);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should relate the trigger to the tooltip via aria-describedby', () => {
    render(
      <Tooltip content="Helper text" defaultOpen>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const tooltip = screen.getByRole('tooltip');
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    expect(tooltip.id).not.toBe('');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('should apply the placement modifier class', () => {
    render(
      <Tooltip content="Helper text" defaultOpen placement="top">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    expect(screen.getByRole('tooltip')).toHaveClass('ore-tooltip__popup', 'ore-tooltip__popup--top');
  });

  it('should follow the controlled open prop over hover', () => {
    const onOpenChange = vi.fn();
    const ui = (open: boolean) => (
      <Tooltip open={open} onOpenChange={onOpenChange} content="Helper text">
        <button type="button">Trigger</button>
      </Tooltip>
    );
    const { rerender } = render(ui(true));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    rerender(ui(false));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseOver(screen.getByRole('button', { name: 'Trigger' }));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('should render initially when defaultOpen is set', () => {
    render(
      <Tooltip content="Helper text" defaultOpen>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('should always report open changes through onOpenChange', () => {
    const onOpenChange = vi.fn();
    render(
      <Tooltip content="Helper text" onOpenChange={onOpenChange}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.mouseOver(trigger);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.mouseOut(trigger);

    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
  });

  it('should not render when the content is empty', () => {
    const { rerender } = render(
      <Tooltip content="" open>
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    rerender(
      <Tooltip content={null} open>
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should merge className and forward rest props and style to the wrapper', () => {
    render(
      <Tooltip
        content="Helper text"
        defaultOpen
        className="extra"
        data-testid="tooltip-wrap"
        style={{ color: 'rgb(255, 0, 0)' }}
      >
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const wrapper = screen.getByTestId('tooltip-wrap');
    expect(wrapper).toHaveClass('ore-tooltip', 'extra');
    expect(wrapper).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    expect(screen.getByRole('tooltip').parentElement).toBe(document.body);
  });

  it('should warn in development when children are not a single element', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <Tooltip content="Helper text" defaultOpen>
        {'plain text' as unknown as ReactElement}
      </Tooltip>,
    );

    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls[0]?.[0]).toContain('single ReactElement');
    expect(screen.getByText('plain text')).toBeInTheDocument();
    errorSpy.mockRestore();
  });
});
