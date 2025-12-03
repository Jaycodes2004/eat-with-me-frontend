import { useEffect } from 'react';
import apiClient from './api';

type KitchenOrder = any; // replace with your actual type if you have one

type KitchenEvent =
  | { type: 'created'; order: KitchenOrder }
  | { type: 'updated'; order: KitchenOrder }
  | { type: 'deleted'; orderId: string };

export function useKitchenLiveUpdates(
  enabled: boolean,
  onEvent: (event: KitchenEvent) => void
) {
  useEffect(() => {
    if (!enabled) return;

    const baseURL = (apiClient.defaults.baseURL || '').replace(/\/$/, '');
    const url = `${baseURL}/kitchen/stream`;

    const es = new EventSource(url, { withCredentials: true });

    es.onmessage = (event) => {
      try {
        const data: KitchenEvent = JSON.parse(event.data);
        onEvent(data);
      } catch {
        // ignore malformed messages
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [enabled, onEvent]);
}
