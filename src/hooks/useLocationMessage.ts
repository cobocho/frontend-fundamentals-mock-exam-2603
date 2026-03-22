import { useCallback, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface LocationMessage {
  text: string;
  type: 'success' | 'error';
}

export function useLocationMessage() {
  const location = useLocation();
  const locationState = location.state as { text?: string; type?: 'success' | 'error' } | null;

  const [message, setMessage] = useState<LocationMessage | null>(
    locationState?.text ? { text: locationState.text, type: locationState.type ?? 'success' } : null
  );

  useEffect(() => {
    if (locationState?.text) {
      window.history.replaceState({}, '');
    }
  }, [locationState]);

  const setSuccessMessage = useCallback((text: string) => {
    setMessage({ text, type: 'success' });
  }, []);

  const setErrorMessage = useCallback((text: string) => {
    setMessage({ text, type: 'error' });
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  const createMessage = (type: 'success' | 'error', text: string): LocationMessage => ({
    text,
    type,
  });

  return { message, setSuccessMessage, setErrorMessage, clearMessage, createMessage };
}
