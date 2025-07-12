import React from "react";
import leggingsModel from "../assets/Leggings-banner.png";

const LeggingsBanner = () => (
  <div style={{
    background: "white",
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
        stroke="#c6aa62"
        strokeWidth="1"
      />
    </svg>

    {/* Text content on the left */}
    <div style={{
      flex: "0 0 50%",
      paddingLeft: "80px",
      paddingRight: "40px",
      zIndex: 2
    }}>
      <h1 style={{
        fontSize: "48px",
        lineHeight: 1.2,
        color: "#181818",
        marginBottom: "8px",
        fontFamily: "'AllrounderMonument', serif"
      }}>
        Comfort Meets Style: <span style={{ color: "#c6aa62" }}>Yarika<br />Leggings</span>
      </h1>
      
      <p style={{
        fontSize: "20px",
        color: "#181818",
        marginBottom: "32px",
        fontFamily: "'Inter', sans-serif",
        opacity: 0.9
      }}>
        All-day comfort, perfect stretch. Your go-to for every outfit.
      </p>

      <a href="/leggings" style={{
        display: "inline-flex",
        alignItems: "center",
        background: "#c6aa62",
        color: "white",
        padding: "16px 32px",
        borderRadius: "8px",
        textDecoration: "none",
        fontSize: "18px",
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif"
      }}>
        Discover Leggings <span style={{ marginLeft: "8px" }}>→</span>
      </a>
    </div>

    {/* Model image on the right */}
    <div style={{
      flex: "0 0 50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden"
    }}>
      <img
        src={leggingsModel}
        alt="Yarika Leggings"
        style={{
          maxHeight: "100%",
          width: "auto",
          objectFit: "contain"
        }}
      />
    </div>
  </div>
);

export default LeggingsBanner; 