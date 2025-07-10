import React from "react";
import blouseModel from "../Img/Blouse-banner.png";

const BlouseBanner = () => (
  <div style={{
    background: "linear-gradient(to right, #c6aa62, #d4af37)",
    height: 480,
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    borderRadius: "8px",
    margin: "0 40px",
    maxWidth: 1300,
    marginLeft: "auto",
    marginRight: "auto"
  }}>
    {/* Geometric lines as SVG background */}
    <svg
      style={{
        position: "absolute",
        top: 0, left: 0, width: "100%", height: "100%", zIndex: 0,
        opacity: 0.2
      }}
      viewBox="0 0 1440 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0,0 L1440,480" stroke="#fff" strokeWidth="1" />
      <path d="M1440,0 L0,480" stroke="#fff" strokeWidth="1" />
      <path d="M720,0 L720,480" stroke="#fff" strokeWidth="1" />
      <path d="M0,240 L1440,240" stroke="#fff" strokeWidth="1" />
      <path d="M360,0 L360,480" stroke="#fff" strokeWidth="1" />
      <path d="M1080,0 L1080,480" stroke="#fff" strokeWidth="1" />
    </svg>
    
    {/* Left side with image */}
    <div style={{ 
      position: "absolute",
      left: "-100px",
      bottom: "-20px",
      zIndex: 1,
      height: "480px"
    }}>
      <img 
        src={blouseModel} 
        alt="Yarika Blouses" 
        style={{ 
          height: "100%",
          width: "auto",
          objectFit: "contain"
        }} 
      />
    </div>

    {/* Right side with text */}
    <div style={{ 
      marginLeft: "auto",
      maxWidth: "50%",
      paddingRight: "80px",
      zIndex: 2,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "24px"
    }}>
      <h1 style={{ 
        fontSize: 48, 
        fontWeight: 700, 
        color: "#181818",
        fontFamily: "'AllrounderMonument', serif",
        lineHeight: 1.2,
        margin: 0
      }}>
        Yarika's Exquisite<br />
        Readymade Blouses
      </h1>
      <p style={{ 
        fontSize: 24, 
        color: "#181818", 
        fontFamily: "'Inter', Arial, sans-serif",
        maxWidth: 480,
        margin: 0,
        opacity: 0.9
      }}>
        Elevate your ethnic wear with our stunning collection. Perfect fits, timeless designs.
      </p>
      <a href="/products" style={{
        background: "#181818",
        color: "#fff",
        padding: "16px 32px",
        borderRadius: 8,
        fontSize: 18,
        fontWeight: 500,
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "'Inter', Arial, sans-serif",
        width: "fit-content",
        marginTop: 8
      }}>
        Explore Blouses <span style={{ marginLeft: 4 }}>→</span>
      </a>
    </div>
  </div>
);

export default BlouseBanner; 