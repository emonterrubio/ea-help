import type { ReactNode } from 'react';
import type { ChipStyle } from '@/types/domain';

export type ChipSize = 'chip-sm' | 'chip-md' | 'chip-lg';

interface ChipProps {
  children: ReactNode;
  chipStyle?: ChipStyle;
  chipSize?: ChipSize;
  /** When provided the chip renders as a toggle-style button. */
  onClick?: () => void;
  pressed?: boolean;
}

/** Small status/filter pill. Renders a `<button>` only when it is interactive. */
export const Chip = ({ children, chipStyle = 'chip-gray', chipSize = 'chip-md', onClick, pressed }: ChipProps) => {
  const className = `chip ${chipStyle} ${chipSize}`;

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick} aria-pressed={pressed}>
        {children}
      </button>
    );
  }

  return <span className={className}>{children}</span>;
};
