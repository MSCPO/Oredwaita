import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ActionRow, EntryRow, ExpanderRow, LinkRow, PasswordEntryRow, SwitchRow } from '../Rows';

describe('<SwitchRow />', () => {
  const user = userEvent.setup();

  it('should call onActiveChange exactly once when the switch is clicked', async () => {
    const onActiveChange = vi.fn();
    render(<SwitchRow title="Wi-Fi" active={false} onActiveChange={onActiveChange} />);

    await user.click(screen.getByRole('switch'));
    expect(onActiveChange).toHaveBeenCalledTimes(1);
    expect(onActiveChange).toHaveBeenCalledWith(true);
  });

  it('should label the switch with the row title', () => {
    render(<SwitchRow title="Wi-Fi" active={false} onActiveChange={vi.fn()} />);

    expect(screen.getByRole('switch', { name: 'Wi-Fi' })).toBeInTheDocument();
  });

  it('should toggle when the row itself is clicked', async () => {
    const onActiveChange = vi.fn();
    render(<SwitchRow title="Wi-Fi" active={false} onActiveChange={onActiveChange} />);

    await user.click(screen.getByRole('button', { name: /Wi-Fi/ }));
    expect(onActiveChange).toHaveBeenCalledTimes(1);
    expect(onActiveChange).toHaveBeenCalledWith(true);
  });

  it('should toggle via keyboard (Enter)', () => {
    const onActiveChange = vi.fn();
    render(<SwitchRow title="Wi-Fi" active={false} onActiveChange={onActiveChange} />);

    fireEvent.keyDown(screen.getByRole('button', { name: /Wi-Fi/ }), { key: 'Enter' });
    expect(onActiveChange).toHaveBeenCalledTimes(1);
    expect(onActiveChange).toHaveBeenCalledWith(true);
  });

  it('should toggle its internal state when active is not provided', async () => {
    const onActiveChange = vi.fn();
    render(<SwitchRow title="Wi-Fi" onActiveChange={onActiveChange} />);

    const toggle = screen.getByRole('switch', { name: 'Wi-Fi' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);
    expect(onActiveChange).toHaveBeenCalledTimes(1);
    expect(onActiveChange).toHaveBeenCalledWith(true);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('should start from defaultActive when provided', () => {
    render(<SwitchRow title="Wi-Fi" defaultActive />);

    expect(screen.getByRole('switch', { name: 'Wi-Fi' })).toHaveAttribute('aria-checked', 'true');
  });
});

describe('<ExpanderRow />', () => {
  const user = userEvent.setup();

  it('should not expand/collapse when the enable switch is clicked', async () => {
    const onEnableSwitchChange = vi.fn();
    const onExpandedChange = vi.fn();
    render(
      <ExpanderRow
        title="Networking"
        showEnableSwitch
        onEnableSwitchChange={onEnableSwitchChange}
        onExpandedChange={onExpandedChange}
      >
        <div>Children</div>
      </ExpanderRow>,
    );

    await user.click(screen.getByRole('switch'));
    expect(onEnableSwitchChange).toHaveBeenCalledTimes(1);
    expect(onEnableSwitchChange).toHaveBeenCalledWith(true);
    expect(onExpandedChange).not.toHaveBeenCalled();
  });

  it('should expose an aria-expanded disclosure button', async () => {
    const onExpandedChange = vi.fn();
    render(
      <ExpanderRow title="Networking" onExpandedChange={onExpandedChange}>
        <div>Children</div>
      </ExpanderRow>,
    );

    const arrow = screen.getByRole('button', { name: 'Expand row' });
    expect(arrow).toHaveAttribute('aria-expanded', 'false');
    await user.click(arrow);
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Collapse row' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('should allow overriding the expand/collapse labels', async () => {
    render(
      <ExpanderRow title="Networking" expandLabel="Open settings" collapseLabel="Close settings">
        <div>Children</div>
      </ExpanderRow>,
    );

    const arrow = screen.getByRole('button', { name: 'Open settings' });
    expect(arrow).toHaveAttribute('aria-expanded', 'false');

    await user.click(arrow);
    expect(screen.getByRole('button', { name: 'Close settings' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('should allow overriding the expand icon', () => {
    render(<ExpanderRow title="Networking" expandIcon="+" />);

    expect(screen.getByRole('button', { name: 'Expand row' })).toHaveTextContent('+');
  });
});

describe('<EntryRow />', () => {
  it('should default the apply button label to Apply', () => {
    render(<EntryRow title="Workspace" value="dev" onChange={vi.fn()} showApplyButton onApply={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });

  it('should allow overriding the apply label', () => {
    render(
      <EntryRow title="Workspace" value="dev" onChange={vi.fn()} showApplyButton applyLabel="Save" onApply={vi.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeInTheDocument();
  });
});

describe('<PasswordEntryRow />', () => {
  const user = userEvent.setup();

  it('should toggle the accessible name between show and hide', async () => {
    render(<PasswordEntryRow title="Token" value="secret" onChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Show password' }));

    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('secret')).toHaveAttribute('type', 'text');
  });

  it('should support custom show/hide labels', async () => {
    render(
      <PasswordEntryRow
        title="Token"
        value="secret"
        onChange={vi.fn()}
        showPasswordLabel="Reveal"
        hidePasswordLabel="Conceal"
      />,
    );

    expect(screen.getByRole('button', { name: 'Reveal' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reveal' }));

    expect(screen.getByRole('button', { name: 'Conceal' })).toBeInTheDocument();
  });
});

describe('<LinkRow />', () => {
  const user = userEvent.setup();

  it('should open the uri in a new tab with noopener,noreferrer', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<LinkRow title="Documentation" uri="https://example.com/docs" />);

    await user.click(screen.getByRole('button', { name: /Documentation/ }));

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith('https://example.com/docs', '_blank', 'noopener,noreferrer');

    openSpy.mockRestore();
  });
});

describe('row rest/style passthrough', () => {
  it('should forward extra props and style to the ActionRow root', () => {
    render(
      <ActionRow title="Basic" id="row-action" data-testid="action-row" style={{ backgroundColor: 'rgb(1, 2, 3)' }} />,
    );

    const row = screen.getByTestId('action-row');
    expect(row).toHaveAttribute('id', 'row-action');
    expect(row).toHaveStyle({ backgroundColor: 'rgb(1, 2, 3)' });
    expect(row).toHaveClass('ore-action-row');
  });

  it('should forward extra props to the SwitchRow root', () => {
    render(<SwitchRow title="Wi-Fi" active={false} onActiveChange={vi.fn()} data-testid="switch-row" />);

    expect(screen.getByTestId('switch-row')).toHaveClass('ore-action-row');
  });

  it('should forward extra props to the ExpanderRow root', () => {
    render(<ExpanderRow title="Networking" data-testid="expander-row" />);

    expect(screen.getByTestId('expander-row')).toHaveClass('ore-expander-row');
  });
});
