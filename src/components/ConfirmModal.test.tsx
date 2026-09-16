// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ConfirmModal from './ConfirmModal';

describe('ConfirmModal accessibility', () => {
  it('traps focus, closes with Escape, and restores the opener focus', () => {
    const onCancel = vi.fn();
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const { rerender } = render(
      <ConfirmModal isOpen title="삭제 확인" onConfirm={vi.fn()} onCancel={onCancel} />,
    );

    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledOnce();
    rerender(<ConfirmModal isOpen={false} onConfirm={vi.fn()} onCancel={onCancel} />);
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });
});
