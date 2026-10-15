import { BackButton } from '@/components/ui/BackButton';

interface NotFoundMessageProps {
  entity: string;
}

/** Shown when a details URL references an id that does not exist. */
export const NotFoundMessage = ({ entity }: NotFoundMessageProps) => (
  <div className="my-8" role="alert">
    <p className="body-default mb-4">We couldn’t find that {entity}.</p>
    <BackButton />
  </div>
);
