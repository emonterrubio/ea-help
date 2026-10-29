import { buildReceiptCase, withUndoRecorded, type ReceiptCaseDetails } from './cases';
import { getDemoState, updateDemoState, type DemoState } from './store';
import type { ActionReceipt } from './types';

/** Reference IDs players can quote to an advisor, e.g. `EAR-MH2K9A1B-3F`. */
export const createReferenceId = (now: Date): string =>
  `EAR-${now.getTime().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, '0')}`;

/** Records a receipt and, when case details are given, its My Cases entry, in one update. */
export const recordReceipt = (
  receipt: ActionReceipt,
  caseDetails?: ReceiptCaseDetails,
  now = new Date(),
): ActionReceipt => {
  const receiptCase = caseDetails ? buildReceiptCase(receipt, caseDetails, now) : undefined;
  const stored = receiptCase ? { ...receipt, caseId: receiptCase.id } : receipt;
  updateDemoState((state) => ({
    ...state,
    receipts: [...state.receipts, stored],
    createdCases: receiptCase ? [receiptCase, ...state.createdCases] : state.createdCases,
  }));
  return stored;
};

export const findReceipt = (referenceId: string, state: DemoState = getDemoState()): ActionReceipt | undefined =>
  state.receipts.find((receipt) => receipt.referenceId === referenceId);

/** Marks a receipt undone and notes it on its case. The caller reverses the change itself. */
export const markReceiptUndone = (referenceId: string, now = new Date()): void => {
  updateDemoState((state) => ({
    ...state,
    receipts: state.receipts.map((receipt) =>
      receipt.referenceId === referenceId && !receipt.undoneAt ? { ...receipt, undoneAt: now.toISOString() } : receipt,
    ),
    createdCases: state.createdCases.map((agentCase) =>
      agentCase.receiptReferenceId === referenceId ? withUndoRecorded(agentCase, now) : agentCase,
    ),
  }));
};
