import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface ErrorToastProps {
  message: string | null;
  onClose: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(onClose, 5000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message, onClose]);

  if (!message && !isVisible) return null;

  return (
    <div
      className={clsx(
        'fixed bottom-4 right-4 z-50 flex items-center max-w-sm w-full p-4 space-x-3 bg-red-500 text-white rounded-lg shadow-lg transition-transform duration-300 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      )}
      role="alert"
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="p-1 rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
