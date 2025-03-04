import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type SnackbarVariant = 'success' | 'error' | 'info' | 'warning';

interface SnackbarProps {
  open: boolean;
  message: string;
  variant?: SnackbarVariant;
  autoHideDuration?: number;
  onClose: () => void;
}

const icons = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
  info: <AlertCircle className="h-5 w-5" />,
  warning: <AlertCircle className="h-5 w-5" />
};

const colors = {
  success: 'bg-green-800 text-green-100 border-green-600',
  error: 'bg-red-800 text-red-100 border-red-600',
  info: 'bg-blue-800 text-blue-100 border-blue-600',
  warning: 'bg-yellow-800 text-yellow-100 border-yellow-600'
};

const iconColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-yellow-400'
};

const Snackbar: React.FC<SnackbarProps> = ({
  open,
  message,
  variant = 'info',
  autoHideDuration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(open);
  
  useEffect(() => {
    setIsVisible(open);
    
    if (open && autoHideDuration !== null) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);
  
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-300 transform translate-y-0 opacity-100">
      <div className={`${colors[variant]} flex items-center p-4 rounded-md border shadow-lg max-w-sm`}>
        <div className={`${iconColors[variant]} mr-3 flex-shrink-0`}>
          {icons[variant]}
        </div>
        <div className="flex-grow mr-2">
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="flex-shrink-0 ml-4 text-gray-300 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(Snackbar);