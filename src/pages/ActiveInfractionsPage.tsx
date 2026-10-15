import { useNavigate } from 'react-router';
import { CardGenericVertical } from '@/components/cards/CardGenericVertical';
import infractions from '@/data/infractions';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { isOpenInfraction } from '@/lib/filters';
import { capitalizeFirstLetter } from '@/lib/text';

const MAX_SCANNED_INFRACTIONS = 6;

export const ActiveInfractionsPage = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const openInfractions = infractions.slice(0, MAX_SCANNED_INFRACTIONS).filter(isOpenInfraction);

  return (
    <div>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-x-6 gap-y-6 mx-auto">
        {openInfractions.map((infraction) => (
          <CardGenericVertical
            key={infraction.id}
            img={infraction.img}
            imgAlt={infraction.game}
            status={capitalizeFirstLetter(infraction.status)}
            chipStyle={infraction.chipStyle}
            label="Started: "
            date={infraction.date}
            title={capitalizeFirstLetter(infraction.title)}
            buttonLabel={capitalizeFirstLetter('see details')}
            onClick={() => navigate(`/infractions/active/${infraction.id}`)}
          />
        ))}
      </div>
    </div>
  );
};
