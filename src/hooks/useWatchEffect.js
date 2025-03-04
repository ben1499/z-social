import { useRef, useEffect } from "react";

export default function useWatchEffect(callback, dependencies) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
