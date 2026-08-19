'use client';

import { useState, useEffect, useCallback } from 'react';

let globalUnread = 0;
let globalListeners: Set<(v: number) => void> = new Set();
let globalInterval: ReturnType<typeof setInterval> | null = null;

function notify(v: number) {
  globalUnread = v;
  globalListeners.forEach(fn => fn(v));
}

function startPolling() {
  if (globalInterval) return;
  const poll = () => {
    fetch('/api/emr/messages')
      .then(r => r.json())
      .then(d => {
        const conversations = d.conversations || [];
        const total = conversations.reduce((sum: number, c: any) => sum + (c.unread_count_doctor || 0), 0);
        notify(total);
      })
      .catch(() => {});
  };
  poll();
  globalInterval = setInterval(poll, 30000);
}

function stopPollingIfIdle() {
  if (globalListeners.size === 0 && globalInterval) {
    clearInterval(globalInterval);
    globalInterval = null;
  }
}

export function useEMRUnreadCount() {
  const [, setTick] = useState(globalUnread);

  useEffect(() => {
    const listener = (v: number) => setTick(v);
    globalListeners.add(listener);
    startPolling();
    return () => {
      globalListeners.delete(listener);
      stopPollingIfIdle();
    };
  }, []);

  return globalUnread;
}
