import { useEffect, useRef } from "react";

export function useAutoCarousel({ selector = ".testimonial-card", interval = 3500 } = {}) {
  const scrollRef = useRef();

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const cards = container.querySelectorAll(selector);
    if (!cards.length) return;

    let index = 0;
    let userInteracted = false;
    let timeoutId;

    // Scroll to the next card
    const scrollToCard = (i) => {
      if (!cards[i]) return;
      container.scrollTo({
        left: cards[i].offsetLeft,
        behavior: "smooth",
      });
    };

    // Auto-scroll logic
    const autoScroll = () => {
      if (userInteracted) return; // Pause auto-scroll on user interaction
      index = (index + 1) % cards.length;
      scrollToCard(index);
      timeoutId = setTimeout(autoScroll, interval);
    };

    timeoutId = setTimeout(autoScroll, interval);

    // Pause auto-scroll on user scroll/touch
    const onUserScroll = () => {
      userInteracted = true;
      clearTimeout(timeoutId);
      // Optionally, resume auto-scroll after a delay
      setTimeout(() => {
        userInteracted = false;
        timeoutId = setTimeout(autoScroll, interval);
      }, 8000); // 8s pause after user interaction
    };

    container.addEventListener("touchstart", onUserScroll, { passive: true });
    container.addEventListener("mousedown", onUserScroll, { passive: true });
    container.addEventListener("wheel", onUserScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("touchstart", onUserScroll);
      container.removeEventListener("mousedown", onUserScroll);
      container.removeEventListener("wheel", onUserScroll);
    };
  }, [selector, interval]);

  return scrollRef;
}
