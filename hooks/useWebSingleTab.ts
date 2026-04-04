import { useEffect, useState } from "react";

function useWebSingleTab(): boolean | null {
  const [isActiveTab, setIsActiveTab] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.locks) {
      setIsActiveTab(true); // set to true to avoid blocking functionality
    }

    let released = false;
    let releaseLock: (() => void) | null = null;

    navigator.locks.request(
      "battery-monitoring-single-tab", // lock name
      { ifAvailable: true },            // only acquire if available
      async (lock) => {
        if (!lock) {
          // Lock not acquired, another tab is active
          setIsActiveTab(false);
          return;
        }
        if (released) return;
        setIsActiveTab(true);
        // Hold the lock for as long as this tab is alive.
        return new Promise<void>((resolve) => {
          releaseLock = resolve;
          if (released) resolve();
        });
      }
    ).catch(() => {});

    return () => {
      released = true;
      releaseLock?.();
    };
  }, []);

  return isActiveTab;
}

export default useWebSingleTab;