import { useEffect, useRef } from 'react';
import type { ConversationItem } from '../conversation';
import { AgentCardView } from './AgentCardView';
import { AgentMessage } from './AgentMessage';
import { HandoffNotice } from './HandoffNotice';
import { StatusLine } from './StatusLine';
import { UserMessage } from './UserMessage';

const ConversationEntry = ({ item }: { item: ConversationItem }) => {
  switch (item.kind) {
    case 'user':
      return <UserMessage text={item.text} attachment={item.attachment} />;
    case 'status':
      return <StatusLine text={item.text} state={item.state} />;
    case 'message':
      return <AgentMessage text={item.text} citations={item.citations} level={item.level} />;
    case 'handoff':
      return (
        <HandoffNotice
          advisorName={item.advisorName}
          summary={item.summary}
          caseId={item.caseId}
          caseNumber={item.caseNumber}
          greeting={item.greeting}
        />
      );
    case 'error':
      return (
        <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm tracking-wide text-rose-800">
          {item.message}
        </p>
      );
    case 'card':
      return <AgentCardView card={item.card} />;
  }
};

const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface ConversationLogProps {
  items: ConversationItem[];
  /** A request is running. */
  isRunning?: boolean;
}

/** Chronological conversation, announced to screen readers as it grows. */
export const ConversationLog = ({ items, isRunning = false }: ConversationLogProps) => {
  const endRef = useRef<HTMLLIElement>(null);
  // Cards and messages complete the active status line, so a run can go quiet while the
  // agent writes its next reply. A visual-only spinner fills that gap; screen readers
  // already heard the status lines, so it is not announced.
  const last = items.at(-1);
  const showWorking = isRunning && !(last?.kind === 'status' && last.state === 'active');

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [items.length, showWorking]);

  return (
    <ol role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation" className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col">
          <ConversationEntry item={item} />
        </li>
      ))}
      {showWorking && (
        <li aria-hidden="true">
          <StatusLine text="Working on it…" state="active" />
        </li>
      )}
      <li ref={endRef} aria-hidden="true" />
    </ol>
  );
};
