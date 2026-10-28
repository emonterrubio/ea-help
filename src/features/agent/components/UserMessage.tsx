/** A message the player typed. */
export const UserMessage = ({ text }: { text: string }) => (
  <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-blue-700 px-3.5 py-2.5">
    <p className="sr-only">You said:</p>
    <p className="body-default text-white">{text}</p>
  </div>
);
