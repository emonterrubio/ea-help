import type { ReactNode } from 'react';

export interface ColumnHeader {
  label: string;
  /** Responsive visibility classes, e.g. `hidden lg:table-cell`. */
  visibility?: string;
}

interface DataTableProps {
  caption: string;
  columns: ColumnHeader[];
  children: ReactNode;
  tableClassName?: string;
}

const HEADER_TEXT = 'text-left electronicArtsTextBold text-sm text-gray-900';

/** Responsive, horizontally scrollable table shell shared by the cases and infractions history. */
export const DataTable = ({ caption, columns, children, tableClassName = '' }: DataTableProps) => (
  <div className="w-full overflow-x-auto rounded-md drop-shadow">
    <table aria-label={caption} className={`${tableClassName} min-w-full divide-solid divide-y divide-gray-300`.trim()}>
      <thead className="bg-gray-50">
        <tr>
          {columns.map(({ label, visibility = '' }, index) => (
            <th
              key={label}
              scope="col"
              className={
                index === 0 ? `py-3.5 pl-6 pr-3 ${HEADER_TEXT}` : `${visibility} px-3 py-3.5 ${HEADER_TEXT}`.trim()
              }
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-solid divide-y divide-gray-200 bg-white">{children}</tbody>
    </table>
  </div>
);
