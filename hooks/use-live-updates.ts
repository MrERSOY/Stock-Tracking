"use client";

import { useState, useEffect, useCallback } from "react";

interface LiveUpdate {
  type: string;
  data?: any;
  message?: string;
  timestamp: string;
}

interface UseLiveUpdatesOptions {
  enabled?: boolean;
  onUpdate?: (update: LiveUpdate) => void;
  onError?: (error: Error) => void;
}

export function useLiveUpdates({
  enabled = true,
  onUpdate,
  onError,
}: UseLiveUpdatesOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<LiveUpdate | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      const eventSource = new EventSource("/api/dashboard/live");

      eventSource.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        // console.log('📡 Live updates connected'); // Removed to reduce spam
      };

      eventSource.onmessage = (event) => {
        try {
          const update: LiveUpdate = JSON.parse(event.data);
          setLastUpdate(update);
          onUpdate?.(update);

          if (update.type === "connected") {
            // console.log('✅ Dashboard live updates established'); // Removed to reduce spam
          }
        } catch (parseError) {
          console.error("Failed to parse live update:", parseError);
          onError?.(parseError as Error);
        }
      };

      eventSource.onerror = (event) => {
        // Only log actual errors, not normal disconnects
        if (eventSource.readyState === EventSource.CONNECTING) {
          console.error("❌ Live updates connection error - retrying...");
        }

        setIsConnected(false);
        setConnectionError("Connection lost. Retrying...");

        // Close the current connection before retrying
        eventSource.close();

        // Auto-reconnect after 5 seconds, but only if we're not already connecting
        setTimeout(() => {
          if (!isConnected) {
            connect();
          }
        }, 5000);
      };

      return eventSource;
    } catch (error) {
      console.error("❌ Failed to create EventSource:", error);
      setConnectionError("Failed to establish connection");
      onError?.(error as Error);
      return null;
    }
  }, [enabled, onUpdate, onError]);

  useEffect(() => {
    const eventSource = connect();

    return () => {
      eventSource?.close();
      setIsConnected(false);
    };
  }, [connect]);

  return {
    isConnected,
    lastUpdate,
    connectionError,
    reconnect: connect,
  };
}
