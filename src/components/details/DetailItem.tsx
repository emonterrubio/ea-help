import type { ReactNode } from 'react';

interface DetailItemProps {
  label: string;
  children: ReactNode;
  /** Typography class for the row. */
  textClassName?: 'body-small' | 'body-default';
  className?: string;
}

/** "Label: value" line inside a details summary box. */
export const DetailItem = ({ label, children, textClassName = 'body-small', className }: DetailItemProps) => (
  <div className={className}>
    <p className={textClassName}>
      <span className="electronicArtsTextBold">{label}: </span>
      {children}
    </p>
  </div>
);
