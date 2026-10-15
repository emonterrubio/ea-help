import { useId, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

interface AlertDismissProps {
  severity: AlertSeverity;
  icon: ReactNode;
  title: string;
  description: string;
  onLearnMore: () => void;
}

/** Inline notice with "Learn more" and "Dismiss" actions. Dismissing hides it until remount. */
export const AlertDismiss = ({ severity, icon, title, description, onLearnMore }: AlertDismissProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const titleId = useId();

  if (!isVisible) return null;

  return (
    <section className={`alert ${severity}`} aria-labelledby={titleId}>
      <div className={`border-solid border-l-8 ${severity} p-4`}>
        <div className="flex">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-3">
            <h2 id={titleId} className={`flex alert-title text-xl ${severity}`}>
              {title}
            </h2>
            <div className="mt-1">
              <p className="body-small">{description}</p>
            </div>
            <div className="mt-4">
              <div className="button -mx-4 -my-1.5 flex">
                <Button buttonWidth="w-auto" buttonStyle="btn-alert-info" buttonSize="btn-md" onClick={onLearnMore}>
                  Learn more
                </Button>
                <Button
                  buttonWidth="w-auto"
                  buttonStyle="btn-alert-info"
                  buttonSize="btn-md"
                  onClick={() => setIsVisible(false)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
