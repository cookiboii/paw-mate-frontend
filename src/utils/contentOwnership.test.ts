import { describe, expect, it } from 'vitest';
import { isPostAuthor } from './contentOwnership';
import type { PostResponseDto } from '../types/review';
import type { User } from '../types/auth';

const post = (values: Partial<PostResponseDto>): PostResponseDto => ({
  id: 1,
  title: 'title',
  content: 'content',
  ...values,
});

describe('isPostAuthor', () => {
  it('uses the author display name exposed by api.md', () => {
    const user: User = { id: 7, name: 'pawuser' };
    expect(isPostAuthor(post({ name: 'pawuser' }), user)).toBe(true);
    expect(isPostAuthor(post({ name: 'another-user' }), user)).toBe(false);
  });

  it('prefers member ID when the API provides one', () => {
    const user: User = { id: 7, name: 'same-name' };
    expect(isPostAuthor(post({ memberId: 7, name: 'different-name' }), user)).toBe(true);
    expect(isPostAuthor(post({ memberId: 8, name: 'same-name' }), user)).toBe(false);
  });

  it('does not identify anonymous users as authors', () => {
    expect(isPostAuthor(post({ name: 'pawuser' }), null)).toBe(false);
  });
});