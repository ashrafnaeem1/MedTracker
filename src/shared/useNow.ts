import { useCallback, useEffect, useState } from "react";

const REFRESH_INTERVAL_MS = 60_000;

export function useNow() {
  const [now, setNow] = useState(() => new Date());
  const refresh = useCallback(() => setNow(new Date()), []);

  useEffect(() => {
    const timer = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return { now, refresh };
}
