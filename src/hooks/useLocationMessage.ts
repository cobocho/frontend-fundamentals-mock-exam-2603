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

  const success = useCallback((text: string): LocationMessage => {
    const msg: LocationMessage = { text, type: 'success' };
    setMessage(msg);
    return msg;
  }, []);

  const error = useCallback((text: string): LocationMessage => {
    const msg: LocationMessage = { text, type: 'error' };
    setMessage(msg);
    return msg;
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return { message, success, error, clearMessage };
}
