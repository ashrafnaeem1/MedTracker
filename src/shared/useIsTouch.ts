import { useEffect, useState } from "react";

const TOUCH_QUERY = "(pointer: coarse)";

export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(() => window.matchMedia(TOUCH_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(TOUCH_QUERY);
    const onChange = () => setIsTouch(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return isTouch;
}
