import { Button } from '@/components/ui/Button';
import { capitalizeFirstLetter } from '@/lib/text';

/** "Was this page helpful?" feedback prompt (buttons are placeholders). */
export const PageHelpful = () => (
  <aside className="flex flex-col" aria-label="Page feedback">
    <div className="min-w-0 flex space-x-2 items-center mx-auto mb-2">
      <div className="electronicArtsTextBold text-base tracking-wide mr-2">
        {capitalizeFirstLetter('was this page helpul?')}
      </div>
      <Button buttonWidth="w-auto" buttonStyle="btn-terciary-outline" buttonSize="btn-sm">
        {capitalizeFirstLetter('yes')}
      </Button>
      <Button buttonWidth="w-auto" buttonStyle="btn-terciary-outline" buttonSize="btn-sm">
        {capitalizeFirstLetter('no')}
      </Button>
    </div>
    <div>
      <p className="mx-auto text-sm tracking-wide text-center">
        {capitalizeFirstLetter('we use this feedback to improve our documentation.')}
      </p>
    </div>
  </aside>
);
