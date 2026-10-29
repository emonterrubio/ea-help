import { useEffect, useId, useRef, type MouseEvent } from 'react';
import { MdAutoAwesome, MdClose } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { useHelpAgent } from '../agentContext';
import { AgentComposer } from './AgentComposer';
import { AiBadge } from './AiBadge';
import { ContextStrip } from './ContextStrip';
import { ConversationLog } from './ConversationLog';
import { SuggestedPrompts } from './SuggestedPrompts';

/**
 * The Help Agent as a modal side sheet (full screen on mobile). Built on the native
 * <dialog>: focus is contained, Esc closes it, and focus returns to the opener.
 */
export const HelpAgentPanel = () => {
  const { state, mode, context, close, send, talkToPerson, prefill } = useHelpAgent();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const hasPlayerMessages = state.items.some((item) => item.kind === 'user');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (state.isOpen && !dialog.open) dialog.showModal();
    if (!state.isOpen && dialog.open) dialog.close();
  }, [state.isOpen]);

  // Clicking the backdrop (the dialog element itself, outside the sheet) closes it.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };

  return (
    // The backdrop click is a pointer convenience; Esc and the close button cover keyboard users.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={close}
      onClick={handleClick}
      className="fixed inset-y-0 left-auto right-0 m-0 hidden h-dvh max-h-dvh w-full max-w-full flex-col bg-white p-0 shadow-2xl open:flex sm:max-w-md backdrop:bg-black/40"
    >
      <header className="flex items-start justify-between gap-x-3 border-0 border-b border-solid border-gray-200 px-4 py-3">
        <div className="flex items-center gap-x-3">
          <span className="hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-700 text-white sm:flex">
            <MdAutoAwesome className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id={titleId}
              className="flex items-center gap-x-2 whitespace-nowrap electronicArtsDisplayBold text-lg leading-tight"
            >
              EA Help Agent <AiBadge />
            </h2>
            <p className="text-sm tracking-wide text-gray-500">AI assistant</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-x-1">
          <Button
            buttonStyle="btn-secondary-outline"
            buttonSize="btn-sm"
            buttonWidth="w-auto"
            onClick={talkToPerson}
            disabled={state.isRunning}
          >
            <span className="whitespace-nowrap">Talk to a person</span>
          </Button>
          <button
            type="button"
            onClick={close}
            aria-label="Close Help Agent"
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <MdClose className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>
      {context && <ContextStrip context={context} />}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <ConversationLog items={state.items} isRunning={state.isRunning} />
        {!hasPlayerMessages && !state.isRunning && context && (
          <div className="mt-4">
            <SuggestedPrompts onPick={send} />
          </div>
        )}
      </div>
      <footer className="border-0 border-t border-solid border-gray-200 px-4 py-3">
        <AgentComposer onSend={send} disabled={state.isRunning} initialValue={prefill} allowImages={mode === 'live'} />
        <p className="mt-2 text-xs tracking-wide text-gray-500">
          The agent is AI and can make mistakes. It always asks before changing your account.
        </p>
      </footer>
    </dialog>
  );
};
