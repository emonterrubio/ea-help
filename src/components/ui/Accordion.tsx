import { useId, useState, type ReactNode } from 'react';
import { BiMinus, BiPlus } from 'react-icons/bi';

interface AccordionProps {
  header: string;
  children: ReactNode;
}

/** Disclosure panel: a button toggles the visibility of its content region. */
export const Accordion = ({ header, children }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const Icon = isOpen ? BiMinus : BiPlus;

  return (
    <div className="border-solid border border-gray-100">
      <button
        type="button"
        className="accordion-title"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="block electronicArtsDisplayBold text-xl tracking-wide">{header}</span>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </button>
      {isOpen && (
        <div id={contentId} className="accordion-content">
          {children}
        </div>
      )}
    </div>
  );
};
