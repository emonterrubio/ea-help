import type { ReactNode } from 'react';

const TEXT_CLASSES = {
  sm: 'text-sm tracking-wide',
  base: 'text-base leading-5 tracking-wide',
} as const;

interface DetailItemProps {
  label: string;
  children: ReactNode;
  size?: keyof typeof TEXT_CLASSES;
  className?: string;
}

/** "Label: value" line inside a details summary box. */
export const DetailItem = ({ label, children, size = 'sm', className }: DetailItemProps) => (
  <div className={className}>
    <p className={TEXT_CLASSES[size]}>
      <span className="electronicArtsTextBold">{label}: </span>
      {children}
    </p>
  </div>
);
