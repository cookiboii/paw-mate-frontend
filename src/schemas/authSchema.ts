import { z } from 'zod';

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
    newPassword: z
      .string()
      .min(6, '새 비밀번호는 6자 이상이어야 합니다.')
      .max(30, '새 비밀번호는 최대 30자까지 가능합니다.'),
    newPasswordConfirm: z.string().min(1, '새 비밀번호 확인을 입력해주세요.'),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: '현재 비밀번호와 다른 새로운 비밀번호를 입력해주세요.',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: '새 비밀번호 확인이 일치하지 않습니다.',
    path: ['newPasswordConfirm'],
  });

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
