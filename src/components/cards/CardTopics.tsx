import type { IconType } from 'react-icons';
import { Button, type ButtonSize, type ButtonStyle, type ButtonWidth } from '@/components/ui/Button';

interface CardTopicsProps {
  icon: IconType;
  title: string;
  subtitle: string;
  buttonLabel: string;
  onClick: () => void;
  buttonStyle?: ButtonStyle;
  buttonSize?: ButtonSize;
  buttonWidth?: ButtonWidth;
}

/** Icon + title + description card with a single call to action. */
export const CardTopics = ({
  icon: Icon,
  title,
  subtitle,
  buttonLabel,
  onClick,
  buttonStyle = 'btn-ghost-solid',
  buttonSize = 'btn-md',
  buttonWidth = 'w-auto',
}: CardTopicsProps) => (
  <article className="flex flex-col justify-between overflow-hidden card">
    <div className="pl-5 pt-5 text-blue-600">
      <Icon className="h-6 w-6" aria-hidden="true" />
    </div>
    <div className="flex-1 flex flex-col justify-between px-6 pt-3 pb-3">
      <div className="flex-1">
        <div className="mb-1">
          <h3 className="electronicArtsDisplayBold text-xl tracking-wide">{title}</h3>
        </div>
        <div>
          <p className="text-base leading-5 tracking-wide">{subtitle}</p>
        </div>
      </div>
      <div className="-ml-3.5 mt-2 flex items-center">
        <Button buttonWidth={buttonWidth} buttonStyle={buttonStyle} buttonSize={buttonSize} onClick={onClick}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  </article>
);
