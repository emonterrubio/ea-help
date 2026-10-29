import { PlaceholderLink } from '@/components/ui/PlaceholderLink';
import { moreHelpLinks } from '@/data/navigation';

interface LinkListProps {
  title: string;
  items: readonly string[];
}

const LinkList = ({ title, items }: LinkListProps) => (
  <div>
    <h2 className="mb-2 electronicArtsDisplayBold text-xl">{title}</h2>
    <ul>
      {items.map((item) => (
        <li key={item} className="mb-1">
          <PlaceholderLink className="text-base leading-5 tracking-wide hover:underline underline-offset-2 decoration-2 decoration-sky-500 pointer">
            {item}
            <br />
          </PlaceholderLink>
        </li>
      ))}
    </ul>
  </div>
);

/** "Learn More" / "Community Help" link lists shown under the infractions section. */
export const MoreHelp = () => (
  <div className="my-12 grid md:grid-cols-2 sm:grid-cols-1 gap-x-6 gap-y-6 mx-4">
    <LinkList title="Learn More" items={moreHelpLinks.learnMore} />
    <LinkList title="Community Help" items={moreHelpLinks.communityHelp} />
  </div>
);
