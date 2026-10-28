import articles from '@/data/articles';
import { answerFor, searchHelpArticles, tokenize } from './search';

describe('tokenize', () => {
  it('drops stopwords and punctuation and trims suffixes', () => {
    expect(tokenize("How do I turn on EA's login verification?")).toEqual(['turn', 'ea', 'login', 'verification']);
  });
});

describe('searchHelpArticles', () => {
  it('ranks the login verification article first', () => {
    const [top] = searchHelpArticles('How do I turn on login verification?');
    expect(top?.article.title).toBe('How to turn on EA Login Verification');
  });

  it("boosts articles about the player's franchises", () => {
    const withGames = searchHelpArticles('ultimate team transfer market', { gameTitles: ['FIFA 23'] });
    expect(withGames[0]?.article.product).toBe('FIFA 22');
  });

  it('returns nothing for empty or stopword-only queries', () => {
    expect(searchHelpArticles('how do I')).toEqual([]);
  });
});

describe('answerFor', () => {
  it('builds a short answer from a real article', () => {
    const answer = answerFor('How do I request a refund?');
    expect(answer).not.toBeNull();
    expect(articles.some((article) => article.id === answer?.article.id)).toBe(true);
    expect(answer?.text.length).toBeLessThanOrEqual(321);
  });

  it('declines when confidence is low', () => {
    expect(answerFor('purple elephants')).toBeNull();
  });
});
