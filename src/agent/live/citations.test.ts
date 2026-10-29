import { CitationRegistry, extractCitations } from './citations';

describe('live citations', () => {
  const registry = new CitationRegistry();
  registry.add({ kind: 'article', articleId: '12', title: 'Login verification' });
  registry.add({ kind: 'policy', policyId: 'instant-restore', label: 'Instant restore policy' });

  it('turns markers returned by tools into citations and strips them from the text', () => {
    const { text, citations } = extractCitations(
      'Turn on login verification in Security settings [article:12]. Restores are instant under $50 [policy:instant-restore].',
      registry,
    );
    expect(text).toBe('Turn on login verification in Security settings. Restores are instant under $50.');
    expect(citations.map((citation) => citation.kind)).toEqual(['article', 'policy']);
  });

  it('drops markers no tool returned, so a citation can never be invented', () => {
    const { text, citations } = extractCitations('Refunds take 5 days [article:999] [purchase:pur-404].', registry);
    expect(text).toBe('Refunds take 5 days.');
    expect(citations).toEqual([]);
  });

  it('cites each source once', () => {
    const { citations } = extractCitations('One [article:12], two [article:12].', registry);
    expect(citations).toHaveLength(1);
  });
});
