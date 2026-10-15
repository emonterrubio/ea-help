interface DividerProps {
  className?: string;
}

/** Thin horizontal rule used between page sections. */
export const Divider = ({ className = '' }: DividerProps) => (
  <hr className={`${className} border-0 border-solid border-b border-gray-200`.trim()} />
);
