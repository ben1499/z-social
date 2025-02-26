import { useState, useEffect, useRef, useCallback } from "react";

export default function useComponentVisible() {
  const [isComponentVisible, setComponentVisible] = useState(false);
  const dropRef = useRef(null);
  const triggerRef = useRef(null);

  const handleClickOutside = useCallback((event) => {
    if (
      dropRef.current &&
      !dropRef.current.contains(event.target) &&
      triggerRef.current &&
      !triggerRef.current.contains(event.target)
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
