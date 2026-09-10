import { describe, expect, it } from 'vitest';
import { getCategoryFromTitle, getCleanTitle, withCategoryPrefix } from './reviewCategory';

describe('reviewCategory', () => {
  it('recognizes supported title prefixes', () => {
    expect(getCategoryFromTitle('[입양후기] 함께한 첫날')).toBe('REVIEW');
    expect(getCategoryFromTitle('[무료 분양] 가족을 찾습니다')).toBe('FREE_ADOPTION');
    expect(getCategoryFromTitle('[제보] 도움이 필요합니다')).toBe('REPORT');
  });

  it('removes legacy prefix variants and applies one canonical prefix', () => {
    expect(getCleanTitle('[유기동물 제보] 발견했습니다')).toBe('발견했습니다');
    expect(withCategoryPrefix('REPORT', '[제보] 발견했습니다')).toBe('[유기동물제보] 발견했습니다');
  });
});
