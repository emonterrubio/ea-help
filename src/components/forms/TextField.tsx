import { useId } from 'react';

const LABEL_CLASS = 'mb-2 block electronicArtsTextRegular text-base text-gray-700';
const CONTROL_CLASS =
  'focus:ring-blue-400 focus:border-blue-400 block w-full sm:text-sm border border-solid border-gray-300 rounded-md shadow-sm outline-none';

interface TextFieldProps {
  label: string;
  name: string;
  /** Renders a 5-row `<textarea>` instead of a single-line input. */
  multiline?: boolean;
  placeholder?: string;
}

/** Labelled single-line input or textarea with the app's form styling. */
export const TextField = ({ label, name, multiline = false, placeholder }: TextFieldProps) => {
  const id = useId();

  return (
    <>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      {multiline ? (
        <textarea id={id} name={name} rows={5} className={`${CONTROL_CLASS} p-3`} placeholder={placeholder} />
      ) : (
        <input id={id} name={name} type="text" className={`${CONTROL_CLASS} p-1`} placeholder={placeholder} />
      )}
    </>
  );
};

export const FIELD_LABEL_CLASS = LABEL_CLASS;
