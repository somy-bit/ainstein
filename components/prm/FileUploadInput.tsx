

import React, { useState, ChangeEvent, DragEvent } from 'react';
import Button from '../common/Button';
import { useTranslations } from '../../hooks/useTranslations';
import { ICON_SIZE } from '../../constants';

interface FileUploadInputProps {
  onFileUpload: (file: File) => void;
  allowedTypes?: string[]; // e.g., ['application/pdf', 'image/jpeg']
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({ onFileUpload, allowedTypes }) => {
  const t = useTranslations();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement | HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File | null) => {
    if (file) {
      if (allowedTypes && !allowedTypes.includes(file.type)) {
        setError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        return;
      }
      setError(null);
      onFileUpload(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => { 
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label
        htmlFor="dropzone-file"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-48 sm:h-56 md:h-64 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors ${dragActive ? "border-primary bg-primary-light/20" : ""}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center p-4">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-slate-400 ${dragActive ? "text-primary" : ""}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 17.25z" />
          </svg>
          <p className={`mb-2 text-xs sm:text-sm text-slate-500 ${dragActive ? "text-primary-dark" : ""}`}>
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className={`text-[10px] sm:text-xs text-slate-500 ${dragActive ? "text-primary-dark" : ""}`}>SVG, PNG, JPG, PDF, DOCX, MP4, etc.</p>
          <Button type="button" onClick={onButtonClick} variant="primary" size="sm" className="mt-3 sm:mt-4">
            Select File
          </Button>
        </div>
        <input ref={inputRef} id="dropzone-file" type="file" className="hidden" onChange={handleChange} />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FileUploadInput;