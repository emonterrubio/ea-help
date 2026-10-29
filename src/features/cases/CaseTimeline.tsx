import type { IconType } from 'react-icons';
import {
  MdAutoAwesome,
  MdChatBubbleOutline,
  MdInfoOutline,
  MdLanguage,
  MdMailOutline,
  MdReceiptLong,
} from 'react-icons/md';
import type { TimelineChannel, TimelineEntry } from '@/services/ea-api/types';

const CHANNELS: Record<TimelineChannel, { label: string; icon: IconType; tone: string }> = {
  web: { label: 'Web', icon: MdLanguage, tone: 'bg-slate-100 text-slate-700' },
  ai: { label: 'AI', icon: MdAutoAwesome, tone: 'bg-blue-100 text-blue-800' },
  chat: { label: 'Chat', icon: MdChatBubbleOutline, tone: 'bg-green-100 text-green-800' },
  email: { label: 'Email', icon: MdMailOutline, tone: 'bg-amber-100 text-amber-900' },
  system: { label: 'Update', icon: MdInfoOutline, tone: 'bg-gray-100 text-gray-700' },
  receipt: { label: 'Receipt', icon: MdReceiptLong, tone: 'bg-violet-100 text-violet-800' },
};

const TimelineItem = ({ entry }: { entry: TimelineEntry }) => {
  const channel = CHANNELS[entry.channel];
  const Icon = channel.icon;

  return (
    <li className="relative pb-6 pl-10 last:pb-0">
      <span aria-hidden="true" className="absolute left-[0.9375rem] top-8 bottom-0 w-px bg-gray-200" />
      <span className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full ${channel.tone}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className={`rounded px-1.5 py-0.5 text-[0.6875rem] electronicArtsTextBold ${channel.tone}`}>
          {channel.label}
        </span>
        <span className="electronicArtsTextBold text-sm text-gray-900">{entry.author}</span>
        <span className="body-small text-gray-500">{entry.at}</span>
      </div>
      <p className="mt-1 electronicArtsTextBold text-sm text-gray-800">{entry.title}</p>
      {entry.body && <p className="mt-1 body-small text-gray-700">{entry.body}</p>}
      {entry.details && entry.details.length > 0 && (
        <ul className="mt-1 pl-5">
          {entry.details.map((detail) => (
            <li key={detail} className="list-item list-disc body-small text-gray-700">
              {detail}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

/** One timeline across web, AI, chat and email, so the story is never split up. */
export const CaseTimeline = ({ entries }: { entries: TimelineEntry[] }) => (
  <section aria-labelledby="case-timeline-heading" className="my-8">
    <h3 id="case-timeline-heading" className="mb-4 electronicArtsTextBold text-base text-gray-800">
      Case timeline
    </h3>
    <ol>
      {entries.map((entry) => (
        <TimelineItem key={entry.id} entry={entry} />
      ))}
    </ol>
  </section>
);
