import { useEffect } from 'react';
import apiClient from './api';

type KitchenOrder = any; // replace with your real order type if you have one

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

    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const data: KitchenEvent = JSON.parse(event.data);
        onEvent(data);
      } catch {
        // ignore bad messages
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [enabled, onEvent]);
}
