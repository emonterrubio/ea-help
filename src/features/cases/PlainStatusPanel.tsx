import type { PlainStatus } from '@/services/ea-api/types';

const ROWS: { key: keyof PlainStatus; label: string }[] = [
  { key: 'now', label: "What's happening now" },
  { key: 'next', label: 'What happens next' },
  { key: 'eta', label: 'Expected' },
];

/** Plain-language case status: now, next, and a predicted window. */
export const PlainStatusPanel = ({ status }: { status: PlainStatus }) => (
  <section aria-labelledby="plain-status-heading" className="my-8 rounded-md bg-blue-50 p-5">
    <h3 id="plain-status-heading" className="electronicArtsDisplayBold text-xl text-gray-900">
      Where your case stands
    </h3>
    {/* dt/dd carry the type classes: the legacy reset styles those elements directly. */}
    <dl className="mt-3 grid gap-3 sm:grid-cols-3">
      {ROWS.map(({ key, label }) => (
        <div key={key}>
          <dt className="electronicArtsTextBold text-xs uppercase tracking-wide text-blue-900">{label}</dt>
          <dd className="mt-1 text-sm tracking-wide text-gray-900">{status[key]}</dd>
        </div>
      ))}
    </dl>
  </section>
);
