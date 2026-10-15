import { useNavigate } from 'react-router';
import { CardTopics } from '@/components/cards/CardTopics';
import { SectionHeading } from '@/components/layout/SectionHeading';
import topics from '@/data/topics';
import { capitalizeEachWord, capitalizeFirstLetter } from '@/lib/text';

/** "Help Topics" grid on the home page. */
export const Topics = () => {
  const navigate = useNavigate();

  return (
    <section>
      <SectionHeading
        title={capitalizeEachWord('help topics')}
        description="Select the help topic that best describes your issue."
      />
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-y-2 gap-x-2 sm:gap-y-4 sm:gap-x-4">
        {topics.map((topic) => (
          <CardTopics
            key={topic.id}
            icon={topic.icon}
            title={capitalizeEachWord(topic.product)}
            subtitle={capitalizeFirstLetter(topic.subtitle)}
            buttonLabel={capitalizeFirstLetter('learn more')}
            onClick={() => navigate(`/topic/${topic.product}`)}
          />
        ))}
      </div>
    </section>
  );
};
