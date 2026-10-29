import cases from '@/data/cases';
import conversation from '@/data/conversation';
import games from '@/data/games';
import eaLogo from '@/assets/images/logos/ea-filled-black-logo.svg';
import { formatTimestamp } from '@/lib/date';
import type { SupportCase } from '@/types/domain';
import { demoPlayer } from './fixtures';
import { simulateLatency } from './latency';
import { getDemoState, updateDemoState, type DemoState } from './store';
import type { ActionReceipt, CaseDraftInput, PlainStatus, TimelineEntry } from './types';

/** A case the Help Agent drafted and the player sent. Shown alongside v1 cases. */
export interface AgentCase extends SupportCase {
  origin: 'agent';
  createdAt: string;
  timeline: TimelineEntry[];
  plainStatus: PlainStatus;
  /** Set when the case records an applied change (a receipt). */
  receiptReferenceId?: string;
}

export type AnyCase = SupportCase | AgentCase;

export const isAgentCase = (supportCase: AnyCase): supportCase is AgentCase =>
  'origin' in supportCase && supportCase.origin === 'agent';

const shortDate = (date: Date): string => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
const shortTime = (date: Date): string =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();

const caseNumberFrom = (now: Date): string => String(now.getTime()).slice(-10);

const timelineForDraft = (draft: CaseDraftInput, at: string): TimelineEntry[] => [
  {
    id: 'ai-summary',
    channel: 'ai',
    author: 'EA Help Agent (AI)',
    at,
    title: 'Conversation with the Help Agent',
    body: draft.summary,
    details: draft.evidence,
  },
  ...(draft.stepsTried.length > 0
    ? [
        {
          id: 'ai-diagnostics',
          channel: 'ai' as const,
          author: 'EA Help Agent (AI)',
          at,
          title: 'Troubleshooting steps tried',
          details: draft.stepsTried,
        },
      ]
    : []),
  {
    id: 'case-created',
    channel: 'system',
    author: 'EA Help',
    at,
    title: 'Case drafted by the Help Agent and sent by you',
  },
  {
    id: 'advisor-joined',
    channel: 'chat',
    author: `${draft.advisorName} (EA Help advisor)`,
    at,
    title: `${draft.advisorName} picked up your case from the agent's summary`,
  },
];

/** Creates a case from a reviewed draft and stores it with the demo data. */
export const createAgentCase = async (draft: CaseDraftInput, now = new Date()): Promise<AgentCase> => {
  await simulateLatency();
  const game = games.find((item) => item.id === draft.gameId);
  const at = `${shortDate(now)} at ${shortTime(now)}`;
  const agentCase: AgentCase = {
    origin: 'agent',
    id: `ai-${now.getTime().toString(36)}`,
    img: game?.logo ?? eaLogo,
    game: game?.title ?? 'EA account',
    platform: demoPlayer.platform,
    case: caseNumberFrom(now),
    status: 'open',
    type: 'active',
    outcome: 'an advisor is reviewing your case',
    date: shortDate(now),
    dateUpdate: shortDate(now),
    time: shortTime(now),
    title: draft.title,
    chipStyle: 'chip-green',
    description: draft.summary,
    conversation: '',
    createdAt: now.toISOString(),
    timeline: timelineForDraft(draft, at),
    plainStatus: {
      now: `${draft.advisorName}, an EA Help advisor, is reviewing your case.`,
      next: `${draft.advisorName} replies here and by email. You won't need to repeat anything.`,
      eta: 'Usually within 4 hours',
    },
  };
  updateDemoState((state) => ({ ...state, createdCases: [agentCase, ...state.createdCases] }));
  return agentCase;
};

/** What a receipt's My Cases entry says about the change. */
export interface ReceiptCaseDetails {
  gameId: string | null;
  summary: string;
  /** Evidence the agent checked before proposing the change. */
  details: string[];
  /** Plain-language result, e.g. "Restored to your account." */
  outcome: string;
}

/** A closed case that records a change the agent applied after the player confirmed (L2). */
export const buildReceiptCase = (receipt: ActionReceipt, details: ReceiptCaseDetails, now: Date): AgentCase => {
  const game = games.find((item) => item.id === details.gameId);
  const at = `${shortDate(now)} at ${shortTime(now)}`;
  return {
    origin: 'agent',
    id: `ai-${receipt.referenceId.toLowerCase()}`,
    img: game?.logo ?? eaLogo,
    game: game?.title ?? 'EA account',
    platform: demoPlayer.platform,
    case: caseNumberFrom(now),
    status: 'closed',
    type: 'active',
    outcome: 'resolved by the Help Agent',
    date: shortDate(now),
    dateUpdate: shortDate(now),
    time: shortTime(now),
    title: receipt.title,
    chipStyle: 'chip-blue',
    description: details.summary,
    conversation: '',
    createdAt: now.toISOString(),
    receiptReferenceId: receipt.referenceId,
    timeline: [
      {
        id: 'ai-checks',
        channel: 'ai',
        author: 'EA Help Agent (AI)',
        at,
        title: 'Checked and proposed by the Help Agent',
        body: details.summary,
        details: details.details,
      },
      { id: 'player-confirmed', channel: 'web', author: 'You', at, title: 'You confirmed the change' },
      {
        id: 'receipt',
        channel: 'receipt',
        author: 'EA Help',
        at,
        title: receipt.title,
        body: `Reference ID ${receipt.referenceId}.${receipt.undoable ? ' You can undo this from this page.' : ''}`,
      },
    ],
    plainStatus: {
      now: `Done. ${details.outcome}`,
      next: receipt.undoable
        ? "There's nothing else you need to do. If this was a mistake, you can undo it here."
        : "There's nothing else you need to do.",
      eta: `Completed ${shortDate(now)}`,
    },
  };
};

/** Notes an undo on a receipt's case. */
export const withUndoRecorded = (agentCase: AgentCase, now: Date): AgentCase => ({
  ...agentCase,
  dateUpdate: shortDate(now),
  time: shortTime(now),
  timeline: [
    ...agentCase.timeline,
    {
      id: 'undone',
      channel: 'receipt',
      author: 'You',
      at: `${shortDate(now)} at ${shortTime(now)}`,
      title: 'Change undone',
      body: `Reference ID ${agentCase.receiptReferenceId ?? ''} was reversed.`,
    },
  ],
  plainStatus: {
    now: 'Undone. The change was reversed.',
    next: 'Ask the Help Agent any time if you want it applied again.',
    eta: `Undone ${shortDate(now)}`,
  },
});

/** Agent-created cases (newest first) followed by the v1 cases. */
export const selectAllCases = (state: DemoState): AnyCase[] => [...state.createdCases, ...cases];

export const findAnyCase = (caseId: string | undefined, state: DemoState = getDemoState()): AnyCase | undefined =>
  selectAllCases(state).find((item) => item.id === caseId);

const isPlayerMessage = (user: string): boolean => user === 'johndoe';

/** Unified timeline for v1 cases, synthesized from their existing records. */
export const timelineForCase = (supportCase: AnyCase): TimelineEntry[] => {
  if (isAgentCase(supportCase)) return supportCase.timeline;

  const opened: TimelineEntry = {
    id: 'opened',
    channel: 'web',
    author: 'You',
    at: supportCase.date,
    title: 'Case opened on EA Help',
    body: supportCase.description,
  };

  if (supportCase.status === 'open') {
    const chat = conversation.map<TimelineEntry>((message) => ({
      id: `chat-${message.id}`,
      channel: 'chat',
      author: isPlayerMessage(message.user) ? 'You' : 'EA Help advisor',
      at: formatTimestamp(message.time),
      title: message.summary ?? (isPlayerMessage(message.user) ? 'Your message' : 'Advisor reply'),
      body: message.message,
    }));
    return [opened, ...chat];
  }

  return [
    opened,
    {
      id: 'reply',
      channel: 'email',
      author: 'EA Help advisor',
      at: `${supportCase.dateUpdate}, ${supportCase.time}`,
      title: `Re: ${supportCase.title}`,
      body: supportCase.conversation,
    },
    {
      id: 'closed',
      channel: 'system',
      author: 'EA Help',
      at: supportCase.dateUpdate,
      title: supportCase.type === 'active' ? 'Case closed, waiting to hear from you' : 'Case resolved',
    },
  ];
};

/** Plain-language status: now, next, and a predicted window. */
export const plainStatusFor = (supportCase: AnyCase): PlainStatus => {
  if (isAgentCase(supportCase)) return supportCase.plainStatus;
  if (supportCase.status === 'open') {
    return {
      now: 'An advisor is looking into your issue.',
      next: "If they need more information, they'll ask here. Otherwise they'll reply with a fix.",
      eta: 'Next reply within 2 business days',
    };
  }
  if (supportCase.type === 'active') {
    return {
      now: 'Closed while we wait to hear from you.',
      next: 'Send a message to reopen it. Otherwise it closes for good in 12 days.',
      eta: 'Reopens as soon as you reply',
    };
  }
  return {
    now: 'Resolved.',
    next: "There's nothing else you need to do.",
    eta: `Closed ${supportCase.dateUpdate}`,
  };
};
