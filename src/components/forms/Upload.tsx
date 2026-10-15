import { useId } from 'react';
import { MdUploadFile } from 'react-icons/md';

/** Drop-zone style file picker (images only). Upload handling is not implemented yet. */
export const Upload = () => {
  const inputId = useId();
  const hintId = useId();

  return (
    <div>
      <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-white hover:border-gray-400 cursor-pointer">
        <div className="flex flex-col">
          <MdUploadFile className="mx-auto h-8 w-8" aria-hidden="true" />
          <div className="flex mt-1">
            <label
              htmlFor={inputId}
              className="relative cursor-pointer bg-white rounded-md body-default font-medium text-blue-600 hover:text-blue-800 focus-within:outline focus-within:outline-2 focus-within:outline-blue-600"
            >
              <span>Upload a file</span>
              <input
                id={inputId}
                name="file-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                aria-describedby={hintId}
              />
            </label>
            <p className="pl-1 body-default">or drag and drop</p>
          </div>
          <div>
            <p id={hintId} className="body-small text-center text-gray-500">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
