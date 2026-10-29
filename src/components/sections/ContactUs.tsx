import { Button } from '@/components/ui/Button';
import { capitalizeFirstLetter } from '@/lib/text';

interface ContactUsProps {
  buttonLabel: string;
}

/** "Can't find what you are looking for?" contact card. */
export const ContactUs = ({ buttonLabel }: ContactUsProps) => (
  <section className="md:flex md:flex-row flex flex-col justify-between card horizontal sm:p-8 p-6">
    <div className="flex-1 pr-3">
      <h2 className="electronicArtsDisplayBold tracking-wide text-2xl">
        {capitalizeFirstLetter("Can't find what you are looking for?")}
      </h2>
      <p className="mt-1 text-base leading-5 tracking-wide">
        {capitalizeFirstLetter("Save time by starting your support request online and we'll connect you to an expert.")}
      </p>
    </div>
    <div className="flex items-center md:pt-0 pt-4">
      <Button buttonWidth="w-full" buttonStyle="btn-secondary-outline" buttonSize="btn-md">
        {buttonLabel}
      </Button>
    </div>
  </section>
);
