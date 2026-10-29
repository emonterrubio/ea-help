import { Button, type ButtonWidth } from '@/components/ui/Button';

interface CardMediaHorizontalProps {
  img: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonWidth: ButtonWidth;
}

/** Wide promo card with a decorative image on the left (hidden on mobile). */
export const CardMediaHorizontal = ({ img, title, subtitle, buttonLabel, buttonWidth }: CardMediaHorizontalProps) => (
  <article className="flex justify-center card horizontal">
    <div className="w-2/3 sm:w-1/4 sm:block hidden">
      <img className="w-auto h-full object-cover overflow-hidden" src={img} alt="" />
    </div>
    <div className="flex-1 flex flex-col sm:flex-row justify-between px-6 py-6">
      <div className="flex-1 my-auto pr-3">
        <div className="mb-2">
          <h2 className="electronicArtsDisplayBold text-2xl tracking-wide">{title}</h2>
        </div>
        <div>
          <p className="text-base leading-5 tracking-wide">{subtitle}</p>
        </div>
      </div>
      <div className="flex mt-4 items-center">
        <Button buttonWidth={buttonWidth} buttonStyle="btn-secondary-solid" buttonSize="btn-md">
          {buttonLabel}
        </Button>
      </div>
    </div>
  </article>
);
