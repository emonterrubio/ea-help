import { Button } from '@/components/ui/Button';

interface CardArticlesProps {
  eyebrow: string;
  title: string;
  preview: string;
  buttonLabel: string;
}

/** Compact article teaser with eyebrow, title, preview text and a ghost link button. */
export const CardArticles = ({ eyebrow, title, preview, buttonLabel }: CardArticlesProps) => (
  <article className="flex flex-col justify-between overflow-hidden border-solid border-t border-gray-200">
    <div className="pt-3">
      <span className="electronicArtsTextBold text-xs tracking-wide uppercase text-slate-600">{eyebrow}</span>
    </div>
    <div className="flex-1 flex flex-col justify-between py-1">
      <div className="flex-1">
        <div className="mb-1">
          <h3 className="electronicArtsDisplayBold text-lg tracking-wide leading-snug">{title}</h3>
        </div>
        <div>
          <p className="text-sm tracking-wide text-slate-600">{preview}</p>
        </div>
      </div>
    </div>
    <div className="-ml-4 flex items-center">
      <Button buttonWidth="w-auto" buttonStyle="btn-ghost-solid" buttonSize="btn-md">
        {buttonLabel}
      </Button>
    </div>
  </article>
);
