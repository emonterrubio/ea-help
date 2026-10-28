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
      return <UserMessage text={item.text} />;
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
        <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 body-small text-rose-800">
          {item.message}
        </p>
      );
    case 'card':
      return <AgentCardView card={item.card} />;
  }
};

const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Chronological conversation, announced to screen readers as it grows. */
export const ConversationLog = ({ items }: { items: ConversationItem[] }) => {
  const endRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [items.length]);

  return (
    <ol role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation" className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col">
          <ConversationEntry item={item} />
        </li>
      ))}
      <li ref={endRef} aria-hidden="true" />
    </ol>
  );
};
