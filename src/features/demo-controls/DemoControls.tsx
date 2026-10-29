import { useId, useState } from 'react';
import { MdOutlineScience } from 'react-icons/md';
import { Link } from 'react-router';
import { setAiLayerEnabled, useAiLayer } from '@/features/flags/aiLayer';
import { advanceIncidents } from '@/services/ea-api/api';
import { resetDemoState } from '@/services/ea-api/store';

interface AiLayerSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const AiLayerSwitch = ({ enabled, onChange }: AiLayerSwitchProps) => {
  const labelId = useId();

  return (
    <div className="flex items-center justify-between gap-x-3">
      <span id={labelId} className="text-sm tracking-wide">
        AI layer (v3)
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby={labelId}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
          enabled ? 'bg-blue-700' : 'bg-gray-300'
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
};

/**
 * Prototype-only controls (not part of the product UI): toggle between v1 and the
 * v3 AI layer, reset demo data, and open the scenario hub. Hidden from parity checks
 * via `data-demo-chrome`.
 */
export const DemoControls = () => {
  const aiEnabled = useAiLayer();
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  return (
    <aside data-demo-chrome aria-label="Prototype controls" className="fixed bottom-4 left-4 z-[55] print:hidden">
      {isExpanded && (
        <div id={panelId} className="mb-2 w-60 rounded-md bg-white p-4 shadow-lg ring-1 ring-black/10 space-y-3">
          <p className="electronicArtsTextBold text-sm text-gray-900">Prototype controls</p>
          <AiLayerSwitch enabled={aiEnabled} onChange={setAiLayerEnabled} />
          <p className="text-sm tracking-wide text-gray-500">
            {aiEnabled ? 'Showing the 2026 AI layer.' : 'Showing v1 (2021) as shipped.'}
          </p>
          {aiEnabled && (
            <button
              type="button"
              className="text-left text-sm tracking-wide text-blue-700 hover:underline"
              onClick={advanceIncidents}
            >
              Simulate incident status update
            </button>
          )}
          <div className="flex items-center justify-between">
            <button type="button" className="text-sm tracking-wide text-blue-700 hover:underline" onClick={resetDemoState}>
              Reset demo data
            </button>
            <Link to="/demo" className="text-sm tracking-wide text-blue-700 hover:underline">
              Scenarios
            </Link>
          </div>
        </div>
      )}
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        className="flex items-center gap-x-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-white shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <MdOutlineScience className="h-4 w-4" aria-hidden="true" />
        <span className="electronicArtsTextBold text-xs tracking-wide">Prototype · {aiEnabled ? 'AI on' : 'v1'}</span>
      </button>
    </aside>
  );
};
