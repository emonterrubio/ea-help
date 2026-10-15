import { MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router';

/** Navigates one step back in browser history. */
export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="electronicArtsTextBold text-base tracking-wide text-left rounded-md text-blue-600 hover:underline hover:decoration-2 hover:underline-offset-4"
      onClick={() => navigate(-1)}
    >
      <span>
        <MdArrowBack className="inline mr-1 mb-1" aria-hidden="true" />
      </span>
      Back
    </button>
  );
};
