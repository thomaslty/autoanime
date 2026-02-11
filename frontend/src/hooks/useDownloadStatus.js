import { useEffect, useRef } from 'react';
import { getSocket } from './useSocket';

/**
 * Hook that subscribes to real-time download status updates for a series.
 *
 * @param {number|string} seriesId - The series ID to watch
 * @param {(data: { seriesId: number, episodes: Array }) => void} onUpdate - Callback when updates arrive
 */
export function useDownloadStatus(seriesId, onUpdate) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!seriesId) return;

    const socket = getSocket();

    socket.emit('watch:series', seriesId);

    const handler = (data) => {
      onUpdateRef.current(data);
    };

    socket.on('download:status-updated', handler);

    return () => {
      socket.off('download:status-updated', handler);
      socket.emit('unwatch:series', seriesId);
    };
  }, [seriesId]);
}
