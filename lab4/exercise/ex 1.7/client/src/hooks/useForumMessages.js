
import { useEffect, useState } from 'react';

export function useForumMessages(channelId) {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!channelId) return undefined;

    const controller = new AbortController();

    async function fetchMessages() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `/api/channels/${channelId}/messages`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid messages response');
        }

        setMsgs(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setMsgs([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchMessages();

    return () => controller.abort();
  }, [channelId, refreshKey]);

  function refresh() {
    setRefreshKey((previous) => previous + 1);
  }

  return { msgs, loading, error, refresh };
}
