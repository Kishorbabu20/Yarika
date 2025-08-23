import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Leggings from '../assets/Leggings.png';
import Lehengha from '../assets/Lehengha.png';
import Blouses from '../assets/Blouses.png';
import LeggingsMobile from '../assets/Leggingsmobile.png';
import LehengaMobile from '../assets/Lehengasmobile.png';
import BlouseMobile from '../assets/Blousemobile.png';

const desktopImages = [
  Lehengha,
  Blouses
];
const mobileImages = [
  LehengaMobile,
  BlouseMobile
];

const featuredItems = [
  {
    id: 1,
    title: "Lehanga",
    subtitle: "Your Style & Comfort",
    link: "/home/bridal",
    image: Lehengha,
    mobileImage: LehengaMobile
  },
  {
    id: 2,
    title: "Readymade Blouse",
    subtitle: "Your Style & Comfort",
    link: "/home/readymade-blouse",
    image: Blouses,
    mobileImage: BlouseMobile
  }
];

const SignatureCollection = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="signature-section">
      <h2 className="signature-heading">Featured</h2>
      <div className="signature-row">
        {featuredItems.map((item) => (
          <div key={item.id} className="signature-simple-card" style={{cursor: 'pointer'}} onClick={() => window.location.href = item.link}>
            <img 
              src={isMobile ? item.mobileImage : item.image} 
              alt={item.title} 
              className="signature-simple-img" 
            />
            <div className="signature-overlay">
              <div className="overlay-subtitle">{item.subtitle}</div>
              <div className="overlay-title">{item.title}</div>
              <div className="featured shop-now-btn">Shop Now</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SignatureCollection; 