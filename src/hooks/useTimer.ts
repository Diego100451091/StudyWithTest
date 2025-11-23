import { useState, useEffect } from 'react';

/**
 * Hook for managing timer state
 * @param isActive - Whether the timer should be running
 * @returns Current elapsed time in seconds
 */
export const useTimer = (isActive: boolean = true) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const reset = () => setElapsed(0);

  return { elapsed, reset };
};
