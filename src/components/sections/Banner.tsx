import { Button } from '@/components/ui/Button';
import { usePlaceholderAction } from '@/hooks/usePlaceholderAction';

interface BannerProps {
  title: string;
  subtitle: string;
  buttonLabel: string;
}

/** Solid-color promo banner with a centered heading and outline CTA. */
export const Banner = ({ title, subtitle, buttonLabel }: BannerProps) => {
  const onAction = usePlaceholderAction();

  return (
    <section className="ea-color-blue60 p-10 flex flex-col">
      <div className="mx-auto">
        <h2 className="electronicArtsDisplayRegular mb-2 text-center text-white sm:text-5xl text-4xl">{title}</h2>
        <p className="text-base leading-5 tracking-wide text-center text-white">{subtitle}</p>
      </div>
      <div className="sm:mx-auto mt-4">
        <Button buttonWidth="w-full sm:w-auto" buttonStyle="btn-white-outline" buttonSize="btn-md" onClick={onAction}>
          {buttonLabel}
        </Button>
      </div>
    </section>
  );
};
