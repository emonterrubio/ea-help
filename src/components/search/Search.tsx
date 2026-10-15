import { useId, useMemo, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import articles from '@/data/articles';
import { capitalizeFirstLetter } from '@/lib/text';
import { findMatchingArticles, MAX_SEARCH_RESULTS } from './searchArticles';

interface SearchProps {
  placeholder: string;
}

/**
 * Article title search with a type-ahead result list.
 *
 * The list opens as soon as the query has at least one match and stays open
 * (showing "No results found" when the query stops matching) until the user
 * clears it with the close button or by backspacing the field to empty.
 * Submitting the form performs a native GET submit, as in the legacy app.
 */
export const Search = ({ placeholder }: SearchProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputId = useId();
  const listId = useId();

  const matches = useMemo(() => findMatchingArticles(articles, query), [query]);
  const visibleMatches = matches.slice(0, MAX_SEARCH_RESULTS);
  const statusText = matches.length === 0 ? 'No results found' : 'Search results';

  const close = () => {
    setQuery('');
    setIsOpen(false);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    if (findMatchingArticles(articles, nextQuery).length > 0) setIsOpen(true);
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && event.currentTarget.value === '') close();
  };

  return (
    <div className="relative">
      <form className="w-full relative rounded-sm shadow-sm" role="search">
        <label htmlFor={inputId} className="sr-only">
          {placeholder}
        </label>
        <input
          id={inputId}
          name="search"
          type="text"
          autoComplete="off"
          className="py-3 pl-3 pr-24 outline-none border-solid border border-gray-200 focus:border-gray-500 block inter-regular w-full rounded-md"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
        />
        {isOpen && (
          <button
            type="button"
            onClick={close}
            className="absolute inset-y-0 right-14 flex items-center pointer-events-auto"
            aria-label="Clear search"
          >
            <MdClose className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center pointer-events-auto rounded-r-md bg-blue-700"
          aria-label="Search"
        >
          <MdSearch className="text-white m-3 h-6 w-6" aria-hidden="true" />
        </button>
      </form>
      <div id={listId} className={`search-results ${isOpen ? 'block' : 'hidden'}`}>
        <p className="p-2.5 electronicArtsTextBold text-sm text-slate-600 uppercase" role="status">
          {statusText}
        </p>
        <ul role="listbox" aria-label="Search results">
          {visibleMatches.map((article) => (
            <li
              key={article.id}
              role="option"
              aria-selected={false}
              className="bg-white body-default py-2 px-3 border-b border-solid border-slate-200 last-of-type:border-0 hover:bg-slate-100 hover:text-blue-600 cursor-pointer"
            >
              <p className="body-small text-slate-500">{capitalizeFirstLetter(article.product)}</p>
              <p className="body-default">{capitalizeFirstLetter(article.title)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
