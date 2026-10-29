import type { ReactNode } from 'react';

interface MessageCardProps {
  avatarSrc: string;
  avatarAlt: string;
  author: string;
  timestamp: string;
  heading?: string;
  body: string;
  /** Extra content under the body (e.g. attachments). */
  children?: ReactNode;
  /** Visual tone: `slate` for live threads, `zinc` for archived ones. */
  tone?: 'slate' | 'zinc';
}

const TONE_CLASSES = {
  slate: 'bg-slate-100 border-slate-300',
  zinc: 'bg-zinc-100 border-zinc-400',
} as const;

/** A single message in a support conversation thread. */
export const MessageCard = ({
  avatarSrc,
  avatarAlt,
  author,
  timestamp,
  heading,
  body,
  children,
  tone = 'slate',
}: MessageCardProps) => (
  <article className={`flex ${TONE_CLASSES[tone]} border border-solid rounded-md p-6`}>
    <div className="mr-4 flex-shrink-0">
      <img
        className={tone === 'slate' ? 'block h-8 w-auto rounded-2xl' : 'block h-8 w-auto'}
        src={avatarSrc}
        alt={avatarAlt}
      />
    </div>
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <p className="text-sm tracking-wide">{author}</p>
        <p className="text-sm tracking-wide">{timestamp}</p>
      </div>
      <div>
        {heading && <h4 className="electronicArtsTextBold text-base text-gray-800">{heading}</h4>}
        <p className="mt-1 text-base leading-5 tracking-wide">{body}</p>
      </div>
      {children}
    </div>
  </article>
);
