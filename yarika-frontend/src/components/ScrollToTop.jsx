import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import '../styles/ScrollToTop.css';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Get the most accurate scroll position
      let scrollTop = 0;
      
      // Primary method - window.scrollY (most reliable)
      if (typeof window !== 'undefined') {
        scrollTop = window.scrollY || window.pageYOffset;
      }
      
      // Fallback methods
      if (document.documentElement) {
        scrollTop = document.documentElement.scrollTop || scrollTop;
      }
      
      if (document.body) {
        scrollTop = document.body.scrollTop || scrollTop;
      }
      
      // Ensure we get a clean number
      scrollTop = Math.max(0, Math.round(scrollTop));
      
      if (scrollTop > 30) { // Show button after just 30px scroll
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Use both scroll and wheel events for better detection
    const handleScroll = () => {
      setTimeout(toggleVisibility, 10); // Small delay to ensure scroll position is updated
    };

    const handleWheel = () => {
      setTimeout(toggleVisibility, 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    // Check initial scroll position
    toggleVisibility();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const scrollToTop = () => {
    try {
      // Force scroll to top using multiple methods
      window.scrollTo(0, 0);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Also set scrollTop on document elements
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
      
      // Force a re-render after scrolling
      setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
      }, 100);
    } catch (error) {
      // Fallback - instant scroll
      window.scrollTo(0, 0);
    }
  };

    // Only show when scrolling down
  if (!isVisible) {
    return null;
  }
  return (
    <div 
      className="scroll-to-top" 
      onClick={scrollToTop}
      onTouchEnd={scrollToTop} // For mobile devices
      style={{ cursor: 'pointer' }}
    >
      <ChevronUp size={20} />
    </div>
  );
};

export default ScrollToTop; 