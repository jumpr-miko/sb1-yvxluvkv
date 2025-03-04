import { useState, useCallback } from 'react';
import { SnackbarVariant } from '../components/Snackbar';

interface SnackbarState {
  open: boolean;
  message: string;
  variant: SnackbarVariant;
  autoHideDuration?: number;
}

const initialState: SnackbarState = {
  open: false,
  message: '',
  variant: 'info',
  autoHideDuration: 5000
};

export function useSnackbar() {
  const [state, setState] = useState<SnackbarState>(initialState);
  
  const showSnackbar = useCallback((message: string, options?: Partial<Omit<SnackbarState, 'message' | 'open'>>) => {
    setState({
      open: true,
      message,
      variant: options?.variant || 'info',
      autoHideDuration: options?.autoHideDuration || 5000
    });
  }, []);
  
  const hideSnackbar = useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
  }, []);
  
  const showSuccess = useCallback((message: string, options?: Partial<Omit<SnackbarState, 'message' | 'open' | 'variant'>>) => {
    showSnackbar(message, { ...options, variant: 'success' });
  }, [showSnackbar]);
  
  const showError = useCallback((message: string, options?: Partial<Omit<SnackbarState, 'message' | 'open' | 'variant'>>) => {
    showSnackbar(message, { ...options, variant: 'error' });
  }, [showSnackbar]);
  
  const showInfo = useCallback((message: string, options?: Partial<Omit<SnackbarState, 'message' | 'open' | 'variant'>>) => {
    showSnackbar(message, { ...options, variant: 'info' });
  }, [showSnackbar]);
  
  const showWarning = useCallback((message: string, options?: Partial<Omit<SnackbarState, 'message' | 'open' | 'variant'>>) => {
    showSnackbar(message, { ...options, variant: 'warning' });
  }, [showSnackbar]);
  
  return {
    ...state,
    showSnackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
}