import type { User } from '../types/auth';
import type { PostResponseDto } from '../types/review';

const sameValue = (left: unknown, right: unknown) =>
  left != null && right != null && String(left).trim() === String(right).trim();

const sameEmail = (left: unknown, right: unknown) =>
  typeof left === 'string' &&
  typeof right === 'string' &&
  left.trim().toLowerCase() === right.trim().toLowerCase();

export const isPostAuthor = (post: PostResponseDto | null | undefined, user: User | null) => {
  if (!post || !user) return false;
  if (post.isMine === true) return true;
  if (post.isMine === false) return false;

  const authorId = post.authorId ?? post.memberId ?? post.writerId;
  if (authorId != null) return sameValue(authorId, user.id);

  return sameEmail(post.email, user.email);
};