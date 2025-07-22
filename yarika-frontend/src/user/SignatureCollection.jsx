import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Leggings from '../assets/Leggings.png';
import Lehenga from '../assets/Lehenga.png';
import Blouse from '../assets/Blouse.png';
import LeggingsMobile from '../assets/Leggingsmobile.png';
import LehengaMobile from '../assets/Lehengasmobile.png';
import BlouseMobile from '../assets/Blousemobile.png';

const desktopImages = [
  Leggings,
  Lehenga,
  Blouse
];
const mobileImages = [
  LeggingsMobile,
  LehengaMobile,
  BlouseMobile
];

const signatureBlouses = [
  {
    id: 1,
    title: "Leggings",
    link: "/home/leggings"
  },
  {
    id: 2,
    title: "Lehanga",
    link: "/home/bridal"
  },
  {
    id: 3,
    title: "Readymade Blouse",
    link: "/home/blouses"
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
      <h2 className="signature-heading">BEST SELLERS</h2>
      <div className="signature-row">
        {signatureBlouses.map((item, idx) => (
          <div key={item.id} className="signature-simple-card">
            <Link to={item.link} className="signature-link">
              <img src={isMobile ? mobileImages[idx] : desktopImages[idx]} alt={item.title + ' page'} className="signature-simple-img" />
              <div className="signature-title">{item.title}</div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SignatureCollection; 