import { ImFilePdf } from 'react-icons/im';

interface AttachmentProps {
  fileName: string;
  size: string;
}

/** File attachment row inside a message. */
export const Attachment = ({ fileName, size }: AttachmentProps) => (
  <div className="flex items-center my-3">
    <div className="flex-shrink-0">
      <ImFilePdf className="h-8 w-8 my-2 text-red-600" aria-hidden="true" />
    </div>
    <div className="ml-3">
      <p className="body-small">{fileName}</p>
      <p className="body-small font-medium">{size}</p>
    </div>
  </div>
);
