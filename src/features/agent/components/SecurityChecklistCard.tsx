import { MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';

interface SecurityChecklistCardProps {
  items: { label: string; done: boolean }[];
}

/** What account recovery changed, and what is still left for the player. */
export const SecurityChecklistCard = ({ items }: SecurityChecklistCardProps) => (
  <section aria-label="Security checklist" className="rounded-lg bg-white p-4 ring-1 ring-gray-300">
    <p className="eyebrow-default text-gray-600">Security checklist</p>
    <ul className="mt-2 space-y-1.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-start gap-x-2">
          {item.done ? (
            <MdCheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-700" aria-hidden="true" />
          ) : (
            <MdRadioButtonUnchecked className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" aria-hidden="true" />
          )}
          <span className="body-small text-gray-900">
            {item.label}
            <span className="sr-only">{item.done ? ' (done)' : ' (to do)'}</span>
          </span>
        </li>
      ))}
    </ul>
  </section>
);
