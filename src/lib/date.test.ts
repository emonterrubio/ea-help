import { formatTimestamp } from './date';

describe('formatTimestamp', () => {
  it('accepts epoch milliseconds as a string or number', () => {
    expect(formatTimestamp('1659978641535')).toBe(formatTimestamp(1659978641535));
    expect(formatTimestamp(0)).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2} (AM|PM)$/);
  });
});
