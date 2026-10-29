import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import infractions from '@/data/infractions';
import { isHistoricalInfraction } from '@/lib/filters';
import { capitalizeFirstLetter } from '@/lib/text';
import type { Infraction } from '@/types/domain';
import { DataTable, type ColumnHeader } from './DataTable';

const COLUMNS: ColumnHeader[] = [
  { label: 'Game' },
  { label: 'Type', visibility: 'hidden lg:table-cell' },
  { label: 'Status', visibility: 'hidden sm:table-cell' },
  { label: 'Start Date' },
  { label: 'End Date' },
  { label: 'Action' },
];

const StatusChip = ({ infraction }: { infraction: Infraction }) => (
  <Chip chipStyle={infraction.chipStyle} chipSize="chip-md">
    {capitalizeFirstLetter(infraction.status)}
  </Chip>
);

const InfractionRow = ({ infraction }: { infraction: Infraction }) => {
  const navigate = useNavigate();

  return (
    <tr>
      <td className="w-1/4 py-4 pl-6 pr-3 electronicArtsTextBold text-sm text-gray-700">
        {infraction.game}
        {/* Stacked details for small screens */}
        <dl className="font-base lg:hidden">
          <dt className="sr-only">Type</dt>
          <dd className="text-sm tracking-wide truncate">{capitalizeFirstLetter(infraction.type)}</dd>
          <dt className="sr-only">Status</dt>
          <dd className="mt-1 truncate text-sm tracking-wide sm:hidden">
            <StatusChip infraction={infraction} />
          </dd>
        </dl>
      </td>
      <td className="w-fit hidden px-3 py-4 text-sm tracking-wide lg:table-cell">{capitalizeFirstLetter(infraction.type)}</td>
      <td className="w-fit hidden px-3 text-sm tracking-wide sm:table-cell">
        <StatusChip infraction={infraction} />
      </td>
      <td className="w-fit px-3 py-4 text-sm tracking-wide lg:table-cell">{infraction.date}</td>
      <td className="w-fit px-3 py-4 text-sm tracking-wide lg:table-cell">{infraction.enddate}</td>
      <td className="w-fit pl-3 pr-4 lg:table-cell">
        <Button
          buttonStyle="btn-terciary-solid"
          buttonSize="btn-sm"
          aria-label={`Details for ${infraction.game} ${infraction.type}`}
          onClick={() => navigate(`/infractions/history/${infraction.id}`)}
        >
          {capitalizeFirstLetter('details')}
        </Button>
      </td>
    </tr>
  );
};

/** History of closed infractions. */
export const InfractionsTable = () => (
  <DataTable caption="Infractions history" columns={COLUMNS}>
    {infractions.filter(isHistoricalInfraction).map((infraction) => (
      <InfractionRow key={infraction.id} infraction={infraction} />
    ))}
  </DataTable>
);
