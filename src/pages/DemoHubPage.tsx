import { SCENARIOS, type Scenario } from '@/agent/demo/scenarios';
import { AUTONOMY_LEVELS } from '@/agent/policy/autonomy';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { useHelpAgent } from '@/features/agent/agentContext';
import { AutonomyBadge } from '@/features/agent/components/AutonomyBadge';
import { setAiLayerEnabled, useAiLayer } from '@/features/flags/aiLayer';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const AutonomyLegend = () => (
  <section aria-labelledby="autonomy-heading" className="mt-10">
    <h2 id="autonomy-heading" className="electronicArtsDisplayBold text-2xl">
      Autonomy is set by risk, not capability
    </h2>
    <p className="mt-2 body-default text-gray-700">Every tool the agent can call has exactly one level.</p>
    <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Object.values(AUTONOMY_LEVELS).map((info) => (
        <div key={info.level} className="rounded bg-white p-4 shadow-sm ring-1 ring-black/5">
          <dt>
            <AutonomyBadge level={info.level} />
          </dt>
          <dd className="mt-2 body-small text-gray-700">
            <span className="electronicArtsTextBold">Agent may:</span> {info.agentMay}
            <br />
            <span className="electronicArtsTextBold">Player sees:</span> {info.playerSees}
          </dd>
        </div>
      ))}
    </dl>
  </section>
);

const ScenarioRow = ({ scenario, canRun, onRun }: { scenario: Scenario; canRun: boolean; onRun: () => void }) => (
  <li className="rounded bg-white p-5 shadow-sm ring-1 ring-black/5">
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="electronicArtsDisplayBold text-xl">{scenario.title}</h3>
      <AutonomyBadge level={scenario.level} />
    </div>
    <p className="mt-1 body-small text-gray-500">{scenario.capability}</p>
    <p className="mt-2 body-default text-gray-900">“{scenario.prompt}”</p>
    <p className="mt-1 body-small text-gray-600">{scenario.outcome}</p>
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <Button
        buttonStyle="btn-secondary-solid"
        buttonSize="btn-sm"
        buttonWidth="w-auto"
        onClick={onRun}
        disabled={!canRun}
      >
        Run scenario
      </Button>
      <code className="body-small text-gray-500">/?scenario={scenario.id}</code>
      <span className="body-small text-gray-500">Full flow: Phase {scenario.phase}</span>
    </div>
  </li>
);

/** Unlisted hub for reviewers: every demo scenario, deep links, and the autonomy model. */
export const DemoHubPage = () => {
  useScrollToTop();
  const aiEnabled = useAiLayer();
  const { open } = useHelpAgent();

  return (
    <div className="my-16">
      <PageContainer>
        <div className="py-10">
          <h1 className="electronicArtsDisplayBold md:text-4xl text-3xl">EA Help v3: AI layer scenarios</h1>
          <p className="mt-3 max-w-3xl body-default text-gray-700">
            A 2026 design vision layered on EA Help v1 (shipped 2021). The Help Agent understands the issue, checks the
            account, and resolves it within strict guardrails. Run a scenario below, or open the agent from any page.
          </p>
          {!aiEnabled && (
            <div role="status" className="mt-4 flex flex-wrap items-center gap-3 rounded-md bg-amber-50 p-4">
              <p className="body-small text-amber-900">The AI layer is off, so you're seeing v1.</p>
              <Button
                buttonStyle="btn-secondary-solid"
                buttonSize="btn-sm"
                buttonWidth="w-auto"
                onClick={() => setAiLayerEnabled(true)}
              >
                Turn on the AI layer
              </Button>
            </div>
          )}
        </div>
        <section aria-labelledby="scenarios-heading">
          <h2 id="scenarios-heading" className="electronicArtsDisplayBold text-2xl">
            Scenarios
          </h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {SCENARIOS.map((scenario) => (
              <ScenarioRow
                key={scenario.id}
                scenario={scenario}
                canRun={aiEnabled}
                onRun={() => open({ scenarioId: scenario.id })}
              />
            ))}
          </ul>
        </section>
        <AutonomyLegend />
      </PageContainer>
    </div>
  );
};
