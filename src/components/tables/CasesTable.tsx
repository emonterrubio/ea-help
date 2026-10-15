import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import cases from '@/data/cases';
import { isHistoricalCase } from '@/lib/filters';
import { capitalizeFirstLetter } from '@/lib/text';
import type { SupportCase } from '@/types/domain';
import { DataTable, type ColumnHeader } from './DataTable';

const COLUMNS: ColumnHeader[] = [
  { label: 'Case Name' },
  { label: 'Game', visibility: 'hidden lg:table-cell' },
  { label: 'Platform', visibility: 'hidden lg:table-cell' },
  { label: 'Status', visibility: 'hidden lg:table-cell' },
  { label: 'Case Number' },
  { label: 'Date Created' },
  { label: 'Last Update' },
  { label: 'Action' },
];

const StatusChip = ({ supportCase }: { supportCase: SupportCase }) => (
  <Chip chipStyle={supportCase.chipStyle} chipSize="chip-md">
    {capitalizeFirstLetter(supportCase.status)}
  </Chip>
);

const CaseRow = ({ supportCase }: { supportCase: SupportCase }) => {
  const navigate = useNavigate();

  return (
    <tr>
      <td className="w-1/4 py-4 pl-6 pr-3 electronicArtsTextBold text-sm text-gray-700">
        {capitalizeFirstLetter(supportCase.title)}
        {/* Stacked details for small screens */}
        <dl className="font-base lg:hidden">
          <dt className="sr-only">Game</dt>
          <dd className="mt-1 truncate body-small">{supportCase.game}</dd>
          <dt className="sr-only">Platform</dt>
          <dd className="truncate body-small">{supportCase.platform}</dd>
          <dt className="sr-only">Status</dt>
          <dd className="mt-1 truncate">
            <StatusChip supportCase={supportCase} />
          </dd>
        </dl>
      </td>
      <td className="w-fit hidden px-3 py-4 body-small lg:table-cell">{supportCase.game}</td>
      <td className="w-fit hidden px-3 py-4 body-small lg:table-cell">{supportCase.platform}</td>
      <td className="w-fit hidden px-3 lg:table-cell">
        <StatusChip supportCase={supportCase} />
      </td>
      <td className="w-fit px-3 py-4 body-small lg:table-cell">{supportCase.case}</td>
      <td className="w-fit px-3 py-4 body-small lg:table-cell">{supportCase.date}</td>
      <td className="w-fit px-3 py-4 body-small lg:table-cell">{supportCase.dateUpdate}</td>
      <td className="w-fit pl-3 pr-4 lg:table-cell">
        <Button
          buttonStyle="btn-terciary-solid"
          buttonSize="btn-sm"
          aria-label={`Details for case ${supportCase.case}`}
          onClick={() => navigate(`/cases/history/${supportCase.id}`)}
        >
          {capitalizeFirstLetter('details')}
        </Button>
      </td>
    </tr>
  );
};

/** History of archived support cases. */
export const CasesTable = () => (
  <DataTable caption="Cases history" columns={COLUMNS} tableClassName="overflow-visible">
    {cases.filter(isHistoricalCase).map((supportCase) => (
      <CaseRow key={supportCase.id} supportCase={supportCase} />
    ))}
  </DataTable>
);
