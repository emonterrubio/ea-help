import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert, type AlertSeverity } from './Alert';

export type { AlertSeverity };

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

  if (!isVisible) return null;

  return (
    <Alert
      severity={severity}
      icon={icon}
      title={title}
      description={description}
      actions={
        <>
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
        </>
      }
    />
  );
};
