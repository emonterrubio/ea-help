import avatar from '@/assets/images/avatar.jpg';
import eaLogoBlack from '@/assets/images/logos/ea-filled-black-logo.svg';
import { Upload } from '@/components/forms/Upload';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import conversation from '@/data/conversation';
import { formatTimestamp } from '@/lib/date';
import { capitalizeFirstLetter } from '@/lib/text';
import type { ConversationMessage } from '@/types/domain';
import { Attachment } from './Attachment';
import { MessageCard } from './MessageCard';

const PLAYER_USERNAME = 'johndoe';
/** Demo data: the player's message that carries an attachment. */
const MESSAGE_WITH_ATTACHMENT_ID = '2';

const ConversationEntry = ({ message }: { message: ConversationMessage }) => {
  const isPlayer = message.user === PLAYER_USERNAME;

  return (
    <li className="my-4">
      <MessageCard
        avatarSrc={isPlayer ? avatar : eaLogoBlack}
        avatarAlt={isPlayer ? `${message.user} avatar` : 'EA Help avatar'}
        author={message.user}
        timestamp={formatTimestamp(message.time)}
        heading={message.summary}
        body={message.message}
      >
        {isPlayer && message.id === MESSAGE_WITH_ATTACHMENT_ID && (
          <Attachment fileName="Screenshot.png" size="101 MB" />
        )}
      </MessageCard>
    </li>
  );
};

/** Reply form for an open support case (placeholder actions). */
export const ReplyForm = () => (
  <>
    <div className="my-4">
      <TextField label="Summary" name="summary" />
    </div>
    <div className="my-4">
      <TextField label="Message" name="message" multiline placeholder="Type your message here" />
    </div>
    <div className="my-4">
      <Upload />
    </div>
    <div className="my-8">
      <div className="flex justify-end space-x-2">
        <Button buttonWidth="w-full sm:w-auto" buttonStyle="btn-terciary-solid" buttonSize="btn-md">
          {capitalizeFirstLetter('cancel')}
        </Button>
        <Button buttonWidth="w-full sm:w-auto" buttonStyle="btn-secondary-solid" buttonSize="btn-md">
          {capitalizeFirstLetter('post')}
        </Button>
      </div>
    </div>
  </>
);

/** v1 message history for an open support case. */
const ConversationHistory = () => (
  <section aria-labelledby="conversation-history-heading">
    <h4 id="conversation-history-heading" className="mb-4 electronicArtsTextBold text-base text-gray-800">
      Conversation history
    </h4>
    <ul>
      {conversation.map((message) => (
        <ConversationEntry key={message.id} message={message} />
      ))}
    </ul>
  </section>
);

/** Reply form plus message history for an open support case (v1). */
export const Conversation = () => (
  <>
    <ReplyForm />
    <ConversationHistory />
  </>
);
