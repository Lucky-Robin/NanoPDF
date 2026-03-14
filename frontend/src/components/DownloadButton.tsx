import React from 'react';
import { Download } from 'lucide-react';
import clsx from 'clsx';

interface DownloadButtonProps {
  blob: Blob | null;
  filename: string;
  disabled?: boolean;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  blob,
  filename,
  disabled = false,
}) => {
  const handleDownload = () => {
    if (!blob || disabled) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || !blob}
      className={clsx(
        'flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors duration-200',
        disabled || !blob
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
          : 'bg-[#0165ff] hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
      )}
    >
      <Download className="w-5 h-5" />
      <span>Download</span>
    </button>
  );
};
