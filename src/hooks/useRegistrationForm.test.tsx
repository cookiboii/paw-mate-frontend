// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ChangeEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useRegistrationForm from './useRegistrationForm';

const navigate = vi.fn();
const showToast = vi.fn();
const verifyEmail = vi.fn();
const verifyCode = vi.fn();

vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));
vi.mock('../context/ToastContext', () => ({ useToast: () => ({ showToast }) }));
vi.mock('../api/auth', () => ({
  registerUser: vi.fn(),
  verifyEmail: (...args: unknown[]) => verifyEmail(...args),
  verifyCode: (...args: unknown[]) => verifyCode(...args),
}));

describe('useRegistrationForm email verification', () => {
  beforeEach(() => vi.clearAllMocks());

  it('resets the issued code state when the email changes', async () => {
    verifyEmail.mockResolvedValue({});
    const { result } = renderHook(() => useRegistrationForm());

    act(() =>
      result.current.handleChange({
        target: { name: 'email', value: 'first@example.com' },
      } as ChangeEvent<HTMLInputElement>),
    );
    await act(() => result.current.handleEmailSend());
    expect(result.current.emailSent).toBe(true);

    act(() =>
      result.current.handleChange({
        target: { name: 'email', value: 'second@example.com' },
      } as ChangeEvent<HTMLInputElement>),
    );
    expect(result.current.emailSent).toBe(false);
    expect(result.current.emailCode).toBe('');
    expect(result.current.emailVerified).toBe(false);
  });

  it('verifies against the address that received the code', async () => {
    verifyEmail.mockResolvedValue({});
    verifyCode.mockResolvedValue({});
    const { result } = renderHook(() => useRegistrationForm());

    act(() =>
      result.current.handleChange({
        target: { name: 'email', value: 'verified@example.com' },
      } as ChangeEvent<HTMLInputElement>),
    );
    await act(() => result.current.handleEmailSend());
    act(() => result.current.setEmailCode('123456'));
    await act(() => result.current.handleEmailVerify());

    await waitFor(() => expect(result.current.emailVerified).toBe(true));
    expect(verifyCode).toHaveBeenCalledWith('verified@example.com', '123456');
  });
});
