import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface LocationMessage {
  text: string;
  type: 'success' | 'error';
}

export function useLocationMessage() {
  const location = useLocation();
  const locationState = location.state as { text?: string; type?: 'success' | 'error' } | null;

  const [locationMessage] = useState<LocationMessage | null>(
    locationState?.text ? { text: locationState.text, type: locationState.type ?? 'success' } : null
  );

  useEffect(() => {
    if (locationState?.text) {
      window.history.replaceState({}, '');
    }
  }, [locationState]);

  const createLocationMessage = (type: 'success' | 'error', text: string) => {
    return { text, type };
  };

  return { locationMessage, createLocationMessage };
}
