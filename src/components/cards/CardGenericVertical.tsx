import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import type { ChipStyle } from '@/types/domain';

interface CardGenericVerticalProps {
  img: string;
  /** Accessible name for the logo image (usually the game title). */
  imgAlt: string;
  status: string;
  chipStyle: ChipStyle;
  label: string;
  date: string;
  title: string;
  buttonLabel: string;
  onClick: () => void;
}

/** Summary card for a support case or infraction: logo, status chip, date, title and CTA. */
export const CardGenericVertical = ({
  img,
  imgAlt,
  status,
  chipStyle,
  label,
  date,
  title,
  buttonLabel,
  onClick,
}: CardGenericVerticalProps) => (
  <article className="flex flex-col card vertical">
    <div className="px-5 pt-6 h-16 overflow-hidden">
      <img className="w-auto h-full object-contain" src={img} alt={imgAlt} />
    </div>
    <div className="flex-1 flex flex-col justify-between px-6 py-6">
      <div className="flex-1">
        <div className="mb-3">
          <Chip chipStyle={chipStyle} chipSize="chip-md">
            {status}
          </Chip>
        </div>
        <div className="mb-1">
          <span className="text-sm tracking-wide">
            {label} {date}
          </span>
        </div>
        <div className="mb-2">
          <h3 className="electronicArtsDisplayBold md:text-xl tracking-wide sm:text-2xl">{title}</h3>
        </div>
      </div>
      <div className="mt-2 flex items-center">
        <Button buttonWidth="w-full" buttonStyle="btn-terciary-solid" buttonSize="btn-md" onClick={onClick}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  </article>
);
