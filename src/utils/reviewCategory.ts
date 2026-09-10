export const REVIEW_CATEGORY_PREFIX = {
  REVIEW: '[입양후기]',
  FREE_ADOPTION: '[무료분양]',
  REPORT: '[유기동물제보]',
} as const;

export type ReviewCategoryKey = keyof typeof REVIEW_CATEGORY_PREFIX;

const CATEGORY_PATTERN = /^\[(입양후기|입양\s*후기|후기|무료분양|무료\s*분양|분양|유기동물제보|유기동물\s*제보|제보)\]\s*/i;

export const getCategoryFromTitle = (title = ''): ReviewCategoryKey => {
  const value = title.trim();
  if (/^\[(유기동물제보|유기동물\s*제보|제보)\]/i.test(value)) return 'REPORT';
  if (/^\[(무료분양|무료\s*분양|분양)\]/i.test(value)) return 'FREE_ADOPTION';
  return 'REVIEW';
};

export const getCleanTitle = (title = ''): string => title.replace(CATEGORY_PATTERN, '').trim();

export const withCategoryPrefix = (category: ReviewCategoryKey, title: string): string =>
  `${REVIEW_CATEGORY_PREFIX[category]} ${getCleanTitle(title)}`.trim();
