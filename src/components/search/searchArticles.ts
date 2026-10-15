import type { Article } from '@/types/domain';

export const MAX_SEARCH_RESULTS = 10;

/** All articles whose title contains `query` (case-insensitive). Empty query → no matches. */
export const findMatchingArticles = (articles: readonly Article[], query: string): Article[] => {
  if (query === '') return [];
  const needle = query.toLowerCase();
  return articles.filter((article) => article.title.toLowerCase().includes(needle));
};
