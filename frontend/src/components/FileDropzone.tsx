import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';
import { Upload, FileUp, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface FileDropzoneProps {
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onFilesSelected: (files: File[]) => void;
  label?: string;
  sublabel?: string;
  showFileList?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept = { 'application/pdf': ['.pdf'] },
  maxFiles = 1,
  maxSize = 52428800,
  onFilesSelected,
  label = 'Choose files or drag & drop it here',
  sublabel = 'Up to 50 MB per file',
  showFileList = true,
}) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setError(null);

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError(`File is too large. Max size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Invalid file type. Please upload a supported file.');
        } else if (rejection.errors[0]?.code === 'too-many-files') {
          setError(`Too many files. Maximum allowed is ${maxFiles}.`);
        } else {
          setError(rejection.errors[0]?.message || 'An error occurred while uploading.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [maxFiles, maxSize, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={clsx(
          'flex flex-col items-center justify-center w-full min-h-[300px] p-6 text-center border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200',
          isDragActive
            ? 'border-[#0165ff] bg-blue-50'
            : error
            ? 'border-red-500 bg-red-50 hover:bg-red-100'
            : 'border-gray-300 bg-white hover:bg-blue-50 hover:border-[#0165ff]'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            className={clsx(
              'p-4 rounded-full',
              isDragActive || acceptedFiles.length > 0 ? 'bg-[#0165ff] text-white' : 'bg-blue-100 text-[#0165ff]'
            )}
          >
            {acceptedFiles.length > 0 ? (
              <FileUp className="w-10 h-10" />
            ) : (
              <Upload className="w-10 h-10" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-gray-900">{label}</h3>
            <p className="text-sm text-gray-500">{sublabel}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center mt-3 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {showFileList && acceptedFiles.length > 0 && !error && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
          <ul className="space-y-2">
            {acceptedFiles.map((file: File) => (
              <li
                key={file.name}
                className="flex items-center justify-between p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg"
              >
                <span className="font-medium text-gray-900 truncate">{file.name}</span>
                <span className="text-gray-500 whitespace-nowrap ml-4">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
