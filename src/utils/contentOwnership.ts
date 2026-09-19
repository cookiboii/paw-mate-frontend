import type { User } from '../types/auth';
import type { PostResponseDto } from '../types/review';

const sameValue = (left: unknown, right: unknown) =>
  left != null && right != null && String(left).trim() === String(right).trim();

export const isPostAuthor = (post: PostResponseDto | null | undefined, user: User | null) => {
  if (!post || !user) return false;
  return sameValue(post.authorId, user.id);
};
