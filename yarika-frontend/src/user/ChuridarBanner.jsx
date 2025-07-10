import React from "react";
import churidarModel from "../Img/Chudidar-banner.png";

const ChuridarBanner = () => (
  <div style={{
    background: "#181818",
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
    {/* Geometric lines pattern */}
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0.2
      }}
      viewBox="0 0 1440 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 120L1440 0M0 240L1440 120M0 360L1440 240M0 480L1440 360"
        stroke="white"
        strokeWidth="1"
      />
    </svg>

    {/* Model image on the left */}
    <div style={{
      position: "relative",
      width: "50%",
      height: "100%",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "flex-start",
      paddingLeft: "20px",
      zIndex: 1
    }}>
      <img
        src={churidarModel}
        alt="Yarika Churidars"
        style={{
          height: "500px",
          width: "auto",
          objectFit: "contain",
          marginBottom: "-20px",
          marginLeft: "-40px"
        }}
      />
    </div>

    {/* Text content on the right */}
    <div style={{
      width: "40%",
      paddingRight: "60px",
      zIndex: 2
    }}>
      <h1 style={{
        fontSize: "48px",
        lineHeight: 1.2,
        color: "white",
        marginBottom: "8px",
        fontFamily: "'AllrounderMonument', serif"
      }}>
        Graceful & Chic: <span style={{ color: "#c6aa62" }}>Yarika<br />Churidars & Tops</span>
      </h1>
      
      <p style={{
        fontSize: "20px",
        color: "white",
        marginBottom: "32px",
        fontFamily: "'Inter', sans-serif",
        opacity: 0.9
      }}>
        Effortless elegance for every occasion. Explore our versatile range.
      </p>

      <a href="/products" style={{
        display: "inline-flex",
        alignItems: "center",
        background: "white",
        color: "#181818",
        padding: "16px 32px",
        borderRadius: "8px",
        textDecoration: "none",
        fontSize: "18px",
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif"
      }}>
        View Churidars <span style={{ marginLeft: "8px" }}>→</span>
      </a>
    </div>
  </div>
);

export default ChuridarBanner; 