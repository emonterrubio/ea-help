import { MdImage } from 'react-icons/md';

interface UserMessageProps {
  text: string;
  /** File name of an attached screenshot. */
  attachment?: string;
}

/** A message the player typed. */
export const UserMessage = ({ text, attachment }: UserMessageProps) => (
  <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-blue-700 px-3.5 py-2.5">
    <p className="sr-only">You said:</p>
    <p className="text-base leading-5 tracking-wide text-white">{text}</p>
    {attachment && (
      <p className="mt-1.5 flex items-center gap-x-1 text-sm tracking-wide text-blue-100">
        <MdImage className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span className="sr-only">Attached screenshot:</span>
        <span className="truncate">{attachment}</span>
      </p>
    )}
  </div>
);
