import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router';
import eaLogoBlack from '@/assets/images/logos/ea-filled-black-logo.svg';
import { Conversation, ReplyForm } from '@/components/conversation/Conversation';
import { MessageCard } from '@/components/conversation/MessageCard';
import { DetailItem } from '@/components/details/DetailItem';
import { DetailsBackBar } from '@/components/details/DetailsBackBar';
import { EntityLogo } from '@/components/details/EntityLogo';
import { NotFoundMessage } from '@/components/details/NotFoundMessage';
import { FIELD_LABEL_CLASS, TextField } from '@/components/forms/TextField';
import { RecordNotice } from '@/components/forms/RecordNotice';
import { Upload } from '@/components/forms/Upload';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Divider } from '@/components/ui/Divider';
import { CaseTimeline } from '@/features/cases/CaseTimeline';
import { PlainStatusPanel } from '@/features/cases/PlainStatusPanel';
import { ReceiptUndoPanel } from '@/features/cases/ReceiptUndoPanel';
import { useCase } from '@/features/cases/useCases';
import { useAiLayer } from '@/features/flags/aiLayer';
import { usePlaceholderAction } from '@/hooks/usePlaceholderAction';
import { isAgentCase, plainStatusFor, timelineForCase } from '@/services/ea-api/cases';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { capitalizeEachWord, capitalizeFirstLetter } from '@/lib/text';
import type { SupportCase } from '@/types/domain';

const CaseSummary = ({ supportCase }: { supportCase: SupportCase }) => (
  <div className="grid md:grid-cols-2 grid-cols-1 gap-x-6 gap-y-1 items-center bg-slate-100 border border-solid border-slate-300 p-5 rounded-md">
    <DetailItem label="Status" className="items-center">
      <Chip chipStyle={supportCase.chipStyle} chipSize="chip-md">
        {capitalizeFirstLetter(supportCase.status)}
      </Chip>
    </DetailItem>
    <DetailItem label="Case number">{supportCase.case}</DetailItem>
    <DetailItem label="Platform">{supportCase.platform}</DetailItem>
    <DetailItem label="Date created">{supportCase.date}</DetailItem>
    <DetailItem label="Last update">
      {supportCase.dateUpdate} at {supportCase.time}
    </DetailItem>
  </div>
);

/** Open, active cases: guidance text plus the live conversation (or, with the AI layer, the unified timeline). */
const LiveConversation = ({ timeline }: { timeline?: ReactNode }) => (
  <div className="my-8">
    <Divider className="my-8" />
    <div className="my-2">
      <p className="text-sm tracking-wide">
        You can exchange case-related information, including photos and pdfs here. Our goal is to respond to your
        message as quickly as possbile. Please allow up to 2 business days for a response. An advisor will only contact
        you if they need more information. If you have questions, you can send a message to your advisor.
      </p>
    </div>
    {timeline ? (
      <>
        <ReplyForm />
        {timeline}
      </>
    ) : (
      <Conversation />
    )}
  </div>
);

/** Closed or archived cases: read-only advisor reply. */
const ArchivedConversation = ({ supportCase }: { supportCase: SupportCase }) => (
  <div className="my-4">
    <Divider className="my-8" />
    <h4 className="mb-4 electronicArtsTextBold text-base text-gray-800">Conversation history</h4>
    <MessageCard
      tone="zinc"
      avatarSrc={eaLogoBlack}
      avatarAlt="EA logo"
      author="EAHelp"
      timestamp={`${supportCase.dateUpdate}, ${supportCase.time}`}
      heading={`Re: ${capitalizeFirstLetter(supportCase.title)}`}
      body={capitalizeFirstLetter(supportCase.conversation)}
    />
  </div>
);

const ResumeCasePrompt = ({ onStart }: { onStart: () => void }) => (
  <div className="my-10">
    <Divider />
    <div className="flex-1 flex flex-col sm:flex-row justify-between px-6 py-6">
      <div className="flex-1 my-auto pr-3">
        <div className="mb-2">
          <h3 className="mb-1 electronicArtsDisplayBold text-2xl tracking-wide">Need more help with this issue?</h3>
        </div>
        <div>
          <p className="text-sm tracking-wide">
            To resume this case, send us a message in which you can add more content such as attachments or continue to
            contact one of our advisors. Otherwise, your case will be closed automatically in 12 days.
          </p>
        </div>
      </div>
      <div className="flex mt-4 items-center">
        <Button buttonWidth="w-full sm:w-auto" buttonStyle="btn-secondary-solid" buttonSize="btn-md" onClick={onStart}>
          {capitalizeFirstLetter('send us a message')}
        </Button>
      </div>
    </div>
  </div>
);

const ResumeCaseForm = ({ onCancel }: { onCancel: () => void }) => {
  const onPost = usePlaceholderAction();

  return (
    <>
      <div className="my-10">
        <Divider className="mb-8" />
        <div className="my-4">
          <h3 className="mb-1 electronicArtsDisplayBold text-2xl tracking-wide">Tell us how we can help you</h3>
        </div>
        <TextField label={capitalizeFirstLetter('summary')} name="summary" />
      </div>
      <div className="my-4">
        <TextField label={capitalizeFirstLetter('message')} name="message" multiline />
      </div>
      <div className="my-4">
        <p className={FIELD_LABEL_CLASS}>{capitalizeFirstLetter('attachments')}</p>
        <div>
          <Upload />
        </div>
        <div className="mt-4">
          <RecordNotice />
        </div>
        <div className="my-8">
          <div className="flex justify-end space-x-2">
            <Button
              buttonWidth="w-full sm:w-auto"
              buttonStyle="btn-terciary-solid"
              buttonSize="btn-md"
              onClick={onCancel}
            >
              {capitalizeFirstLetter('cancel')}
            </Button>
            <Button
              buttonWidth="w-full sm:w-auto"
              buttonStyle="btn-secondary-solid"
              buttonSize="btn-md"
              onClick={onPost}
            >
              {capitalizeFirstLetter('post')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

/** Closed-but-resumable cases let the player reopen the case with a new message. */
const ResumeCase = () => {
  const [isFormShown, setIsFormShown] = useState(false);

  return isFormShown ? (
    <ResumeCaseForm onCancel={() => setIsFormShown(false)} />
  ) : (
    <ResumeCasePrompt onStart={() => setIsFormShown(true)} />
  );
};

export const CaseDetailsPage = () => {
  useScrollToTop();
  const { caseId } = useParams();
  const aiEnabled = useAiLayer();
  const supportCase = useCase(caseId);

  if (!supportCase) return <NotFoundMessage entity="case" />;

  const isActive = supportCase.type === 'active';
  const isLive = isActive && supportCase.status === 'open';
  const receiptReferenceId = isAgentCase(supportCase) ? supportCase.receiptReferenceId : undefined;
  // Receipts record a finished change; there is nothing to resume.
  const isResumable = isActive && supportCase.status === 'closed' && !receiptReferenceId;

  return (
    <div className="-mt-20">
      <DetailsBackBar />
      <div className="relative py-4 w-full h-full bg-slate-50">
        <h2 className="electronicArtsDisplayBold text-2xl tracking-wide">{capitalizeEachWord('case details')}</h2>
      </div>
      <EntityLogo src={supportCase.img} alt={supportCase.game} />
      <div className="my-8">
        <h3 className="electronicArtsTextBold lg:text-3xl sm:text-2xl text-xl">
          {capitalizeFirstLetter(supportCase.title)}
        </h3>
      </div>
      <CaseSummary supportCase={supportCase} />
      <div className="my-8">
        <h4 className="mb-2 electronicArtsTextBold text-base">Original post:</h4>
        <p className="text-base leading-5 tracking-wide">{supportCase.description}</p>
      </div>
      {aiEnabled && <PlainStatusPanel status={plainStatusFor(supportCase)} />}
      {aiEnabled && receiptReferenceId && <ReceiptUndoPanel referenceId={receiptReferenceId} />}
      {aiEnabled ? (
        isLive ? (
          <LiveConversation timeline={<CaseTimeline entries={timelineForCase(supportCase)} />} />
        ) : (
          <>
            <Divider className="my-8" />
            <CaseTimeline entries={timelineForCase(supportCase)} />
          </>
        )
      ) : isLive ? (
        <LiveConversation />
      ) : (
        <ArchivedConversation supportCase={supportCase} />
      )}
      {isResumable && <ResumeCase />}
    </div>
  );
};
