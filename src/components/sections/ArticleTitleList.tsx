import { capitalizeFirstLetter } from '@/lib/text';

interface ArticleTitleListProps {
  titles: string[];
}

/** Plain list of article titles used inside accordions. */
export const ArticleTitleList = ({ titles }: ArticleTitleListProps) => (
  <ul>
    {titles.map((title, index) => (
      <li
        key={`${index}-${title}`}
        className="text-base leading-5 tracking-wide py-2 px-3 hover:bg-slate-100 hover:text-blue-600 cursor-pointer"
      >
        {capitalizeFirstLetter(title)}
      </li>
    ))}
  </ul>
);
