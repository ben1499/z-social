import { useState, useEffect, useRef, useCallback, LegacyRef } from "react";

export default function useComponentVisible<T extends HTMLElement | SVGSVGElement, D extends HTMLDivElement | HTMLUListElement | undefined>() {
  const [isComponentVisible, setComponentVisible] = useState(false);
  const dropRef = useRef<D>(null);
  const triggerRef = useRef<T>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (
      dropRef.current &&
      !dropRef.current.contains(target) &&
      triggerRef.current &&
      !triggerRef.current.contains(target)
    ) {
      setComponentVisible(false);
    }
  }, []);

  useEffect(() => {
    if (isComponentVisible)
      document.addEventListener("click", handleClickOutside, { capture: true });

    return () => {
      document.removeEventListener("click", handleClickOutside, {
        capture: true,
      });
    };
  }, [isComponentVisible, handleClickOutside]);

  return { dropRef, triggerRef, isComponentVisible, setComponentVisible };
}
