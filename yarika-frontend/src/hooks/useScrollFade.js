import { useEffect, useRef, useState } from "react";

export function useScrollFade(options = {}) {
  const { disable = false } = options;
  const ref = useRef(null);
  // Default to fade-in so content is always visible on load
  const [fadeClass, setFadeClass] = useState("fade-in");

  useEffect(() => {
    if (disable) {
      setFadeClass("fade-in");
      return;
    }
    const node = ref.current;
    if (!node) return;

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFadeClass("fade-in");
        } else {
          setFadeClass("fade-out");
        }
      },
      {
        threshold: 0.01,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [disable]);

  return [ref, fadeClass];
}
