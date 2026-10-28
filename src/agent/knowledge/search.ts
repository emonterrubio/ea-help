import articles from '@/data/articles';
import type { Article } from '@/types/domain';

const STOPWORDS = new Set(
  'a an and are at be but by can do does for from get got has have how i if in is it its me my of on or our so that the their them this to up was we what when where which who why will with you your im ive dont cant wont isnt'.split(
    ' ',
  ),
);

/** Lowercases, strips punctuation, drops stopwords and trims common suffixes. */
export const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[’']/g, '')
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
    .map((token) => token.replace(/(ing|ed|es|s)$/, '') || token);

export interface ArticleMatch {
  article: Article;
  score: number;
}

export interface SearchOptions {
  /** Titles of games the player owns (or the current game); matching articles rank higher. */
  gameTitles?: readonly string[];
  limit?: number;
}

/** Franchise words ("fifa", "madden") so "FIFA 22" articles help a "FIFA 23" player. */
const franchiseTokens = (titles: readonly string[]): Set<string> =>
  new Set(titles.flatMap((title) => tokenize(title).filter((token) => !/^\d+$/.test(token))));

const scoreArticle = (article: Article, queryTokens: readonly string[], franchises: Set<string>): number => {
  const titleTokens = new Set(tokenize(article.title));
  const previewTokens = new Set(tokenize(article.preview));
  const productTokens = tokenize(article.product);
  let score = 0;
  for (const token of queryTokens) {
    if (titleTokens.has(token)) score += 3;
    else if (previewTokens.has(token)) score += 1;
    if (productTokens.includes(token)) score += 2;
  }
  if (score > 0 && productTokens.some((token) => franchises.has(token))) score += 1;
  return score;
};

/**
 * Lightweight relevance search over approved help content. Answers may only be built
 * from these results, so every answer can cite a real article (grounding).
 */
export const searchHelpArticles = (
  query: string,
  { gameTitles = [], limit = 5 }: SearchOptions = {},
): ArticleMatch[] => {
  const queryTokens = [...new Set(tokenize(query))];
  if (queryTokens.length === 0) return [];
  const franchises = franchiseTokens(gameTitles);
  return articles
    .map((article) => ({ article, score: scoreArticle(article, queryTokens, franchises) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

/** Minimum score for a confident, answer-first result. */
export const ANSWER_THRESHOLD = 6;

export interface GroundedAnswer {
  article: Article;
  /** Short answer text, taken from the approved article. */
  text: string;
}

const MAX_ANSWER_LENGTH = 320;

const shorten = (text: string): string => {
  if (text.length <= MAX_ANSWER_LENGTH) return text;
  const cut = text.slice(0, MAX_ANSWER_LENGTH);
  const sentenceEnd = cut.lastIndexOf('. ');
  return sentenceEnd > 80 ? cut.slice(0, sentenceEnd + 1) : `${cut.trimEnd()}…`;
};

/** The best cited answer for a question, or `null` when confidence is low. */
export const answerFor = (query: string, options: SearchOptions = {}): GroundedAnswer | null => {
  const [best] = searchHelpArticles(query, { ...options, limit: 1 });
  if (!best || best.score < ANSWER_THRESHOLD) return null;
  return { article: best.article, text: shorten(best.article.preview) };
};
