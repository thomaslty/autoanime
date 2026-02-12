import { useEffect, useRef } from 'react';

const POLL_INTERVAL_MS = 5000;

/**
 * Hook that polls episode download statuses for a series at a fixed interval.
 *
 * @param {number|string} seriesId - The series ID to poll for
 * @param {(data: { seriesId: number, episodes: Array, summary: object }) => void} onUpdate - Callback when new data arrives
 */
export function useDownloadPolling(seriesId, onUpdate) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!seriesId) return;

    let active = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/sonarr/series/${seriesId}/episodes/download-status`);
        if (res.ok && active) {
          const data = await res.json();
          onUpdateRef.current(data);
        }
      } catch {
        // Silently ignore polling errors
      }
    };

    // Initial fetch immediately
    poll();

    const intervalId = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [seriesId]);
}
