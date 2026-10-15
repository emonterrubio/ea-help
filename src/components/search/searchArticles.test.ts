import type { Article } from '@/types/domain';
import { findMatchingArticles } from './searchArticles';

const article = (title: string): Article => ({
  id: title,
  type: 'article',
  product: 'p',
  category: 'c',
  title,
  preview: '',
});

describe('findMatchingArticles', () => {
  const list = [article('Reset my Password'), article('Payments FAQ')];

  it('matches titles case-insensitively', () => {
    expect(findMatchingArticles(list, 'password').map((a) => a.title)).toEqual(['Reset my Password']);
  });

  it('returns nothing for an empty query', () => {
    expect(findMatchingArticles(list, '')).toEqual([]);
  });
});
