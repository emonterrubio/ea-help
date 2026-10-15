import { capitalizeEachWord, capitalizeFirstLetter, truncate } from './text';

describe('capitalizeFirstLetter', () => {
  it('uppercases only the first character', () => {
    expect(capitalizeFirstLetter('learn more')).toBe('Learn more');
    expect(capitalizeFirstLetter('')).toBe('');
  });
});

describe('capitalizeEachWord', () => {
  it('uppercases every space-separated word', () => {
    expect(capitalizeEachWord('help topics')).toBe('Help Topics');
    expect(capitalizeEachWord('self-help tools')).toBe('Self-help Tools');
  });
});

describe('truncate', () => {
  it('returns short strings untouched', () => {
    expect(truncate('FIFA 23', 18)).toBe('FIFA 23');
  });

  it('cuts long strings and appends an ellipsis', () => {
    expect(truncate('The Lord of the Rings: Gollum', 18)).toBe('The Lord of the Ri...');
  });
});
