import { useEffect, useId, useRef, useState } from 'react';
import { MdCheck, MdClose, MdRedo } from 'react-icons/md';
import { findTree } from '@/agent/diagnostics/trees';
import type { DiagnosticLogEntry, DiagnosticTree, StepOutcome } from '@/agent/diagnostics/types';
import { Button } from '@/components/ui/Button';
import { useHelpAgent } from '../agentContext';

const OUTCOME_LABEL: Record<StepOutcome, string> = { done: 'Fixed it', failed: "Didn't work", skipped: 'Skipped' };
const OUTCOME_ICON = { done: MdCheck, failed: MdClose, skipped: MdRedo } as const;
const OUTCOME_CLASS: Record<StepOutcome, string> = {
  done: 'bg-green-100 text-green-800',
  failed: 'bg-rose-100 text-rose-800',
  skipped: 'bg-gray-100 text-gray-700',
};

interface QuestionsProps {
  tree: DiagnosticTree;
  onComplete: (answers: Record<string, string>) => void;
}

/** Two or three targeted questions; the answers choose the authored path. */
const Questions = ({ tree, onComplete }: QuestionsProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const baseId = useId();
  const allAnswered = tree.questions.every((question) => answers[question.id]);

  return (
    <div className="space-y-4">
      {tree.questions.map((question) => (
        <fieldset key={question.id}>
          <legend className="electronicArtsTextBold text-sm text-gray-900">{question.text}</legend>
          <div className="mt-2 space-y-1.5">
            {question.options.map((option) => {
              const id = `${baseId}-${question.id}-${option.value}`;
              return (
                <div key={option.value} className="flex items-center gap-x-2">
                  <input
                    id={id}
                    type="radio"
                    name={`${baseId}-${question.id}`}
                    value={option.value}
                    checked={answers[question.id] === option.value}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.value }))}
                    className="h-4 w-4 accent-blue-700"
                  />
                  <label htmlFor={id} className="body-small text-gray-800">
                    {option.label}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}
      <Button
        buttonStyle="btn-secondary-solid"
        buttonSize="btn-sm"
        buttonWidth="w-auto"
        disabled={!allAnswered}
        onClick={() => onComplete(answers)}
      >
        Start troubleshooting
      </Button>
    </div>
  );
};

interface StepsProps {
  tree: DiagnosticTree;
  path: string[];
  log: DiagnosticLogEntry[];
  onOutcome: (outcome: StepOutcome) => void;
  finished: boolean;
}

/** Interactive step cards with "That didn't work" branching. */
const Steps = ({ tree, path, log, onOutcome, finished }: StepsProps) => {
  const currentRef = useRef<HTMLHeadingElement>(null);
  const currentIndex = log.length;

  useEffect(() => {
    if (!finished) currentRef.current?.focus();
  }, [currentIndex, finished]);

  return (
    <ol className="space-y-2" aria-label="Troubleshooting steps">
      {path.map((stepId, index) => {
        const step = tree.steps[stepId];
        if (!step) return null;
        const entry = log[index];
        const isCurrent = !finished && index === currentIndex;
        const isUpcoming = !entry && !isCurrent;

        if (entry) {
          const Icon = OUTCOME_ICON[entry.outcome];
          return (
            <li key={stepId} className="flex items-center justify-between gap-x-2 rounded-md bg-white px-3 py-2">
              <span className="body-small text-gray-700">
                {index + 1}. {step.title}
              </span>
              <span
                className={`inline-flex flex-shrink-0 items-center gap-x-1 rounded px-1.5 py-0.5 text-[0.6875rem] electronicArtsTextBold ${OUTCOME_CLASS[entry.outcome]}`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {OUTCOME_LABEL[entry.outcome]}
              </span>
            </li>
          );
        }

        if (isUpcoming) {
          return (
            <li key={stepId} className="rounded-md px-3 py-2 body-small text-gray-400">
              {index + 1}. {step.title}
            </li>
          );
        }

        return (
          <li key={stepId} className="rounded-md bg-white p-3 ring-2 ring-blue-600" aria-current="step">
            <p className="body-small text-gray-500">
              Step {index + 1} of {path.length}
            </p>
            <h4 ref={currentRef} tabIndex={-1} className="electronicArtsTextBold text-sm text-gray-900 outline-none">
              {step.title}
            </h4>
            <p className="mt-1 body-small text-gray-800">{step.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                buttonStyle="btn-secondary-solid"
                buttonSize="btn-sm"
                buttonWidth="w-auto"
                onClick={() => onOutcome('done')}
              >
                This fixed it
              </Button>
              <Button
                buttonStyle="btn-secondary-outline"
                buttonSize="btn-sm"
                buttonWidth="w-auto"
                onClick={() => onOutcome('failed')}
              >
                That didn&apos;t work
              </Button>
              <Button
                buttonStyle="btn-ghost-solid"
                buttonSize="btn-sm"
                buttonWidth="w-auto"
                onClick={() => onOutcome('skipped')}
              >
                Skip
              </Button>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

/** Guided diagnostics card (L1): the agent picks the path, the player marks each step. */
export const DiagnosticCard = ({ treeId }: { treeId: string }) => {
  const tree = findTree(treeId);
  const { reportDiagnostic } = useHelpAgent();
  const [answers, setAnswers] = useState<Record<string, string> | null>(null);
  const [log, setLog] = useState<DiagnosticLogEntry[]>([]);
  const [finished, setFinished] = useState(false);
  if (!tree) return null;

  const path = answers ? tree.selectPath(answers) : [];

  const handleOutcome = (outcome: StepOutcome) => {
    const stepId = path[log.length];
    const step = stepId ? tree.steps[stepId] : undefined;
    if (!step || !answers) return;
    const nextLog = [...log, { stepId: step.id, title: step.title, outcome }];
    setLog(nextLog);
    const isLast = nextLog.length === path.length;
    if (outcome === 'done' || isLast) {
      setFinished(true);
      reportDiagnostic({
        treeId: tree.id,
        treeTitle: tree.title,
        answers: tree.questions.map((question) => ({
          question: question.text,
          answer: question.options.find((option) => option.value === answers[question.id])?.label ?? '',
        })),
        log: nextLog,
        outcome: outcome === 'done' ? 'resolved' : 'unresolved',
      });
    }
  };

  return (
    <section
      aria-label={`Guided troubleshooting: ${tree.title}`}
      className="rounded-lg bg-sky-50 p-4 ring-1 ring-sky-200"
    >
      <p className="eyebrow-default text-sky-900">Guided troubleshooting · {tree.platform}</p>
      <h3 className="mb-3 electronicArtsTextBold text-base text-gray-900">{tree.title}</h3>
      {answers ? (
        <Steps tree={tree} path={path} log={log} onOutcome={handleOutcome} finished={finished} />
      ) : (
        <Questions tree={tree} onComplete={setAnswers} />
      )}
    </section>
  );
};
