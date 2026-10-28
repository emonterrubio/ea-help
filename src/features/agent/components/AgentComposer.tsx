import { useEffect, useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import { MdSend } from 'react-icons/md';

interface AgentComposerProps {
  onSend: (text: string) => void;
  disabled: boolean;
  initialValue: string;
}

/** Free-text input: Enter sends, Shift+Enter adds a new line. */
export const AgentComposer = ({ onSend, disabled, initialValue }: AgentComposerProps) => {
  const [text, setText] = useState(initialValue);
  const inputId = useId();
  const hintId = useId();

  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-x-2">
      <label htmlFor={inputId} className="sr-only">
        Describe your issue
      </label>
      <textarea
        id={inputId}
        // The dialog moves focus here when it opens.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        rows={2}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-describedby={hintId}
        placeholder="Describe your issue in your own words"
        className="block w-full resize-none rounded-md border border-solid border-gray-300 px-3 py-2 body-default shadow-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
      />
      <p id={hintId} className="sr-only">
        Press Enter to send, Shift and Enter for a new line.
      </p>
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        aria-label="Send"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-blue-700 text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        <MdSend className="h-5 w-5" aria-hidden="true" />
      </button>
    </form>
  );
};
