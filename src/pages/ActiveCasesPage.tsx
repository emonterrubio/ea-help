import { useNavigate } from 'react-router';
import { CardGenericVertical } from '@/components/cards/CardGenericVertical';
import cases from '@/data/cases';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { isActiveCase } from '@/lib/filters';
import { capitalizeFirstLetter } from '@/lib/text';

const MAX_SCANNED_CASES = 6;

export const ActiveCasesPage = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const activeCases = cases.slice(0, MAX_SCANNED_CASES).filter(isActiveCase);

  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-x-6 gap-y-6 mx-auto">
      {activeCases.map((supportCase) => (
        <CardGenericVertical
          key={supportCase.id}
          img={supportCase.img}
          imgAlt={supportCase.game}
          status={capitalizeFirstLetter(supportCase.status)}
          chipStyle={supportCase.chipStyle}
          label="Created: "
          date={supportCase.date}
          title={capitalizeFirstLetter(supportCase.title)}
          buttonLabel={capitalizeFirstLetter('see details')}
          onClick={() => navigate(`/cases/active/${supportCase.id}`)}
        />
      ))}
    </div>
  );
};
