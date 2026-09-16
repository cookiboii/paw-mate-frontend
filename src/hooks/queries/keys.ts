export const queryKeys = {
  animals: {
    all: ['animals'] as const,
    complete: (species = 'ALL') => ['animals', 'all', species] as const,
    detail: (id?: string | number) => ['animals', 'detail', String(id ?? '')] as const,
    list: (page: number, size: number, species = 'ALL') =>
      ['animals', 'list', { page, size, species }] as const,
  },
  users: {
    all: ['users'] as const,
    me: (session: number) => ['auth', 'profile', session] as const,
  },
  adoptions: { all: ['adoptions'] as const, mine: ['adoptions', 'mine'] as const },
  reviews: {
    all: ['reviews'] as const,
    detail: (id?: string | number) => ['reviews', 'detail', String(id ?? '')] as const,
    bookmarks: ['reviews', 'bookmarks'] as const,
  },
  comments: (postId: string | number, session: number) =>
    ['comments', String(postId), session] as const,
};
