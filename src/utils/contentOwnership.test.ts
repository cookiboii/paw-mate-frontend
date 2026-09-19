import { describe, expect, it } from 'vitest';
import { isPostAuthor } from './contentOwnership';
import type { PostResponseDto } from '../types/review';
import type { User } from '../types/auth';

const post = (values: Partial<PostResponseDto>): PostResponseDto => ({
  id: 1,
  authorId: 7,
  title: 'title',
  content: 'content',
  name: 'pawuser',
  createdAt: '2026-09-20T00:00:00',
  img: null,
  likeCount: 0,
  commentCount: 0,
  likedByMe: false,
  bookmarkedByMe: false,
  ...values,
});

describe('isPostAuthor', () => {
  it('compares the post authorId with the current user ID', () => {
    const user: User = { id: 7, name: 'same-name' };
    expect(isPostAuthor(post({ authorId: 7, name: 'different-name' }), user)).toBe(true);
    expect(isPostAuthor(post({ authorId: 8, name: 'same-name' }), user)).toBe(false);
  });

  it('does not infer ownership from a matching display name', () => {
    const user: User = { id: 7, name: 'pawuser' };
    expect(isPostAuthor(post({ authorId: null, name: 'pawuser' }), user)).toBe(false);
  });

  it('does not identify anonymous users as authors', () => {
    expect(isPostAuthor(post({ name: 'pawuser' }), null)).toBe(false);
  });
});
