'use client';

import { useState, useEffect } from 'react';

export function useEMRUnreadCount(pollInterval = 30000) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchCount = () => {
      fetch('/api/emr/messages')
        .then(r => r.json())
        .then(d => {
          const conversations = d.conversations || [];
          const total = conversations.reduce((sum: number, c: any) => sum + (c.unread_count_doctor || 0), 0);
          setUnread(total);
        })
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval]);

  return unread;
}
