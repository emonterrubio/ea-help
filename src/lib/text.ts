/** Uppercases the first character, leaving the rest untouched. */
export const capitalizeFirstLetter = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

/** Uppercases the first character of every space-separated word. */
export const capitalizeEachWord = (text: string): string => text.split(' ').map(capitalizeFirstLetter).join(' ');

/** Cuts `text` to `maxLength` characters and appends an ellipsis when it was longer. */
export const truncate = (text: string, maxLength: number): string =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
