import { useId } from 'react';
import { useParams } from 'react-router';
import { DetailItem } from '@/components/details/DetailItem';
import { DetailsBackBar } from '@/components/details/DetailsBackBar';
import { EntityLogo } from '@/components/details/EntityLogo';
import { NotFoundMessage } from '@/components/details/NotFoundMessage';
import { Upload } from '@/components/forms/Upload';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { PlaceholderLink } from '@/components/ui/PlaceholderLink';
import { Divider } from '@/components/ui/Divider';
import infractions from '@/data/infractions';
import { usePlaceholderAction } from '@/hooks/usePlaceholderAction';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { capitalizeEachWord, capitalizeFirstLetter } from '@/lib/text';
import type { Infraction } from '@/types/domain';

const InfractionSummary = ({ infraction }: { infraction: Infraction }) => (
  <div className="grid sm:grid-cols-2 grid-cols-1 gap-x-6 gap-y-2 items-center bg-slate-100 border border-solid border-slate-300 p-5 rounded-md">
    <DetailItem label="Status" size="base" className="flex items-center">
      <Chip chipStyle={infraction.chipStyle} chipSize="chip-md">
        {capitalizeFirstLetter(infraction.status)}
      </Chip>
    </DetailItem>
    <DetailItem label="Type" size="base" className="flex items-center">
      {capitalizeFirstLetter(infraction.type)}
    </DetailItem>
    <DetailItem label="Start date" size="base" className="flex items-center">
      {infraction.date}
    </DetailItem>
    <DetailItem label="End date" size="base" className="flex items-center">
      {infraction.enddate}
    </DetailItem>
  </div>
);

const DisputeForm = () => {
  const onAction = usePlaceholderAction();
  const detailsId = useId();

  return (
    <section aria-labelledby={`${detailsId}-heading`}>
      <div className="mt-8">
        <h3 id={`${detailsId}-heading`} className="electronicArtsDisplayBold text-2xl">
          Dispute this infraction
        </h3>
      </div>
      <div className="mt-4">
        <p className="text-base leading-5 tracking-wide">
          Please fill out the form below and inlcude any detailed information to support your dispute. We will contact
          you as soon as possible after we review your case.
        </p>
      </div>
      <div className="mt-4">
        <label htmlFor={detailsId} className="sr-only">
          Dispute details
        </label>
        <textarea
          id={detailsId}
          name="message"
          rows={5}
          className="focus:ring-blue-400 focus:border-blue-400 block w-full border border-solid border-gray-300 rounded-md shadow-sm outline-none p-3 text-base leading-5 tracking-wide"
          placeholder="Supporting details may include notification, messages, ect you saw on your account or in-game."
        />
      </div>
      <div className="mt-4">
        <p className="text-base leading-5 tracking-wide">Add any other supporting files or screenshots to help us with your case.</p>
      </div>
      <div className="mt-4">
        <Upload />
      </div>
      <div className="mt-4 bg-zinc-100 p-4 border border-dashed border-zinc-300 rounded-md">
        <p className="text-base leading-5 tracking-wide">
          <span className="electronicArtsTextBold text-base tracking-wide">Note:</span> Our advisors may take up to 14
          days to review your case. You can check out{' '}
          <PlaceholderLink className="text-base leading-5 tracking-wide text-blue-600 hover:border-solid border-b-2 border-blue-600 pointer">
            this article
          </PlaceholderLink>{' '}
          here for more info about what to expect.
        </p>
      </div>
      <div className="mt-5">
        <div className="flex justify-end space-x-2">
          <Button
            buttonWidth="w-full sm:w-auto"
            buttonStyle="btn-terciary-solid"
            buttonSize="btn-md"
            onClick={onAction}
          >
            {capitalizeFirstLetter('cancel')}
          </Button>
          <Button
            buttonWidth="w-full sm:w-auto"
            buttonStyle="btn-secondary-solid"
            buttonSize="btn-md"
            onClick={onAction}
          >
            {capitalizeFirstLetter('submit')}
          </Button>
        </div>
      </div>
      <Divider className="my-10" />
    </section>
  );
};

export const InfractionDetailsPage = () => {
  useScrollToTop();
  const { infractionId } = useParams();
  const infraction = infractions.find((item) => item.id === infractionId);

  if (!infraction) return <NotFoundMessage entity="infraction" />;

  return (
    <div className="-mt-14">
      <DetailsBackBar />
      <div className="my-4">
        <h2 className="electronicArtsDisplayBold text-2xl tracking-wide">{capitalizeEachWord('infraction details')}</h2>
      </div>
      <EntityLogo src={infraction.img} alt={infraction.game} />
      <div className="my-8">
        <h3 className="electronicArtsTextBold lg:text-3xl sm:text-2xl text-xl tracking-wide">{infraction.title}</h3>
      </div>
      <InfractionSummary infraction={infraction} />
      <div className="my-8">
        <p className="electronicArtsTextBold text-base mb-2">{capitalizeFirstLetter('suspension details')}</p>
        <p className="text-base leading-5 tracking-wide">{infraction.description}</p>
      </div>
      <Divider />
      {infraction.status === 'open' && <DisputeForm />}
    </div>
  );
};
