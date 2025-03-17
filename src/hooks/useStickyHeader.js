import { useRef, useEffect } from "react";

export default function useStickyHeader() {
    const stickyRef = useRef(null);

    useEffect(() => {
      // timeout to wait for the element to be mounted
      const timeoutId = setTimeout(() => {
        const el = stickyRef.current;
        if (el) {
          // Check if the ref is attached to an element
          const observer = new IntersectionObserver(
            ([e]) =>
              e.target.classList.toggle("is-pinned", e.intersectionRatio < 1),
            { threshold: [1] }
          );
          observer.observe(el);
    
          // Cleanup: Important to avoid memory leaks
          return () => {
            observer.unobserve(el);
            clearTimeout(timeoutId);
          };
        }
      }, 100);
    
      return () => clearTimeout(timeoutId);
    }, []);

    return { stickyRef };
}

