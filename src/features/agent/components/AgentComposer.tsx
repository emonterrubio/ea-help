import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { MdAddPhotoAlternate, MdClose, MdSend } from 'react-icons/md';
import type { ImageAttachment } from '@/agent/protocol';
import { prepareScreenshot } from '../screenshot';

interface AgentComposerProps {
  onSend: (text: string, image?: ImageAttachment) => void;
  disabled: boolean;
  initialValue: string;
  /** Screenshots can be attached (live mode: the model reads them). */
  allowImages?: boolean;
}

const firstImage = (files: FileList | null | undefined): File | undefined =>
  Array.from(files ?? []).find((file) => file.type.startsWith('image/'));

/** Free-text input: Enter sends, Shift+Enter adds a new line. In live mode it also takes a screenshot. */
export const AgentComposer = ({ onSend, disabled, initialValue, allowImages = false }: AgentComposerProps) => {
  const [text, setText] = useState(initialValue);
  const [image, setImage] = useState<ImageAttachment | null>(null);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();

  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend(text, allowImages && image ? image : undefined);
    setText('');
    setImage(null);
  };

  const attach = async (file: File | undefined) => {
    if (!file || !allowImages) return;
    setImageError('');
    try {
      setImage(await prepareScreenshot(file));
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'That screenshot couldn’t be attached.');
    }
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

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    void attach(firstImage(event.target.files));
    event.target.value = '';
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const file = firstImage(event.clipboardData.files);
    if (!allowImages || !file) return;
    event.preventDefault();
    void attach(file);
  };

  const handleDragOver = (event: DragEvent<HTMLTextAreaElement>) => {
    if (allowImages) event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLTextAreaElement>) => {
    const file = firstImage(event.dataTransfer.files);
    if (!allowImages || !file) return;
    event.preventDefault();
    void attach(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      {allowImages && image && (
        <div className="mb-2 flex items-center gap-x-2 rounded-md bg-gray-100 px-2.5 py-1.5">
          <img
            src={`data:${image.mediaType};base64,${image.data}`}
            alt=""
            className="h-8 w-8 flex-shrink-0 rounded object-cover"
          />
          <p className="min-w-0 flex-1 truncate body-small text-gray-700">{image.name}</p>
          <button
            type="button"
            onClick={() => setImage(null)}
            aria-label="Remove screenshot"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-gray-600 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <MdClose className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
      {imageError && (
        <p id={errorId} role="alert" className="mb-2 body-small text-red-700">
          {imageError}
        </p>
      )}
      <div className="flex items-end gap-x-2">
        {allowImages && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFile}
              hidden
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              aria-label="Attach a screenshot"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md border border-solid border-gray-300 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <MdAddPhotoAlternate className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
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
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          aria-describedby={imageError ? `${hintId} ${errorId}` : hintId}
          placeholder="Describe your issue in your own words"
          className="block w-full resize-none rounded-md border border-solid border-gray-300 px-3 py-2 body-default shadow-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />
        <p id={hintId} className="sr-only">
          Press Enter to send, Shift and Enter for a new line.
          {allowImages ? ' You can paste or drop a screenshot.' : ''}
        </p>
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          aria-label="Send"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-blue-700 text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <MdSend className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};
