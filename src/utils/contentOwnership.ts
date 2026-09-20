import type { User } from '../types/auth';
import type { PostResponseDto } from '../types/review';

const sameValue = (left: unknown, right: unknown) =>
  left != null && right != null && String(left).trim() === String(right).trim();

export const isPostAuthor = (post: PostResponseDto | null | undefined, user: User | null) => {
  if (!post || !user) return false;
  return sameValue(post.authorId, user.id);
};

export const hasAdminRole = (role: unknown) =>
  typeof role === 'string' && ['ADMIN', 'ROLE_ADMIN'].includes(role.toUpperCase());

export const isAdminContentAuthor = (
  content: { authorId?: number | string | null; authorRole?: string; role?: string } | null | undefined,
  user: User | null,
) => {
  if (!content) return false;
  if (hasAdminRole(content.authorRole) || hasAdminRole(content.role)) return true;
  return hasAdminRole(user?.role) && sameValue(content.authorId, user?.id);
};