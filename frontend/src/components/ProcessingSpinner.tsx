import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingSpinnerProps {
  message?: string;
}

export const ProcessingSpinner: React.FC<ProcessingSpinnerProps> = ({
  message = 'Processing your PDF...',
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex flex-col items-center justify-center space-y-4 backdrop-blur-sm">
      <Loader2 className="w-12 h-12 text-white animate-spin" />
      <p className="text-white text-lg font-medium tracking-wide">{message}</p>
    </div>
  );
};
