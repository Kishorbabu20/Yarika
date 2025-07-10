import React from "react";
import MarqueeImg from '../Img/Yarika Logo (3).png';

const logoCount = 8;

const MarqueeLogo = () => (
  <div style={{
    width: "100%",
    overflow: "hidden",
    background: "transparent",
    margin: "0 auto",
    padding: 0
  }}>
    <div
      style={{
        display: "flex",
        width: "max-content",
        animation: "marquee 18s linear infinite"
      }}
      className="yarika-marquee-track"
    >
      {Array.from({ length: logoCount }).map((_, i) => (
        <img
          key={i}
          src={MarqueeImg}
          alt="Yarika Marquee"
          style={{
            height: 60,
            margin: "0 32px",
            opacity: 0.4,
            flexShrink: 0
          }}
        />
      ))}
      {Array.from({ length: logoCount }).map((_, i) => (
        <img
          key={logoCount + i}
          src={MarqueeImg}
          alt="Yarika Marquee"
          style={{
            height: 60,
            margin: "0 32px",
            opacity: 0.4,
            flexShrink: 0
          }}
        />
      ))}
    </div>
    <style>
      {`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}
    </style>
  </div>
);

export default MarqueeLogo;
