import type { Citation } from '../protocol';

/*
 * The live model cites sources with markers such as [article:12] copied from tool
 * results. Only sources a tool actually returned in this conversation become chips;
 * any other marker is dropped, so a citation can never point at something invented.
 */

const MARKER = /\s?\[(article|purchase|policy|incident):([\w.-]+)\]/g;

const keyOf = (kind: Citation['kind'], id: string): string => `${kind}:${id}`;

const idOf = (citation: Citation): string => {
  switch (citation.kind) {
    case 'article':
      return citation.articleId;
    case 'purchase':
      return citation.purchaseId;
    case 'policy':
      return citation.policyId;
    case 'incident':
      return citation.incidentId;
  }
};

export const markerFor = (citation: Citation): string => `[${keyOf(citation.kind, idOf(citation))}]`;

/** Sources returned by tools so far in one conversation. */
export class CitationRegistry {
  private readonly known = new Map<string, Citation>();

  add(citation: Citation): string {
    this.known.set(keyOf(citation.kind, idOf(citation)), citation);
    return markerFor(citation);
  }

  get(kind: Citation['kind'], id: string): Citation | undefined {
    return this.known.get(keyOf(kind, id));
  }
}

const isCitationKind = (value: string): value is Citation['kind'] =>
  value === 'article' || value === 'purchase' || value === 'policy' || value === 'incident';

/** Strips every marker from the text and returns the grounded citations, in order, without duplicates. */
export const extractCitations = (text: string, registry: CitationRegistry): { text: string; citations: Citation[] } => {
  const citations: Citation[] = [];
  const cleaned = text.replace(MARKER, (_match, kind: string, id: string) => {
    const citation = isCitationKind(kind) ? registry.get(kind, id) : undefined;
    if (citation && !citations.includes(citation)) citations.push(citation);
    return '';
  });
  return { text: cleaned.replace(/[ \t]+([.,;:!?])/g, '$1').trim(), citations };
};
