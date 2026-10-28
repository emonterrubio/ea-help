import { DIAGNOSTIC_TREES, findTree, treeFor } from './trees';

describe('authored diagnostic trees', () => {
  it.each(DIAGNOSTIC_TREES.map((tree) => [tree.id, tree]))('%s only references authored steps', (_id, tree) => {
    const combos = tree.questions.reduce<Record<string, string>[]>(
      (acc, question) =>
        acc.flatMap((answers) => question.options.map((option) => ({ ...answers, [question.id]: option.value }))),
      [{}],
    );
    for (const answers of combos) {
      const path = tree.selectPath(answers);
      expect(path.length).toBeGreaterThan(0);
      path.forEach((stepId) => expect(tree.steps[stepId]).toBeDefined());
    }
  });

  it('asks two or three targeted questions', () => {
    DIAGNOSTIC_TREES.forEach((tree) => expect(tree.questions.length).toBeGreaterThanOrEqual(2));
    DIAGNOSTIC_TREES.forEach((tree) => expect(tree.questions.length).toBeLessThanOrEqual(3));
  });

  it('chooses the path from the answers', () => {
    const tree = findTree('bf2042-ps5-crash');
    expect(tree?.selectPath({ when: 'multiplayer', error: 'none' })[1]).toBe('network');
    expect(tree?.selectPath({ when: 'launch', error: 'none' })[1]).toBe('storage');
  });

  it('finds trees by game and platform', () => {
    expect(treeFor('8', 'PS5')?.id).toBe('bf2042-ps5-crash');
    expect(treeFor('8', 'PC')).toBeUndefined();
  });
});
