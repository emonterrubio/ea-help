import { useId, type ReactNode } from 'react';

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

export interface AlertProps {
  severity: AlertSeverity;
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  /** Extra body under the description, such as status lines. */
  children?: ReactNode;
  /** Action row. Uses the same text-button layout as the info alert. */
  actions?: ReactNode;
  headingLevel?: 'h2' | 'h3';
  /** Accessible name for the region. Defaults to the visible title. */
  label?: string;
}

/** Shared alert shell: severity bar, icon, title, body, and optional actions. */
export const Alert = ({
  severity,
  icon,
  title,
  description,
  children,
  actions,
  headingLevel: Heading = 'h2',
  label,
}: AlertProps) => {
  const titleId = useId();

  return (
    <section className={`alert ${severity}`} aria-label={label} aria-labelledby={label ? undefined : titleId}>
      <div className={`border-solid border-l-8 ${severity} p-4`}>
        <div className="flex">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-3">
            <Heading id={titleId} className={`flex alert-title text-xl ${severity}`}>
              {title}
            </Heading>
            {description != null && (
              <div className="mt-1">
                <p className="body-small">{description}</p>
              </div>
            )}
            {children}
            {actions != null && (
              <div className="mt-4">
                <div className="button -mx-4 -my-1.5 flex flex-wrap">{actions}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
