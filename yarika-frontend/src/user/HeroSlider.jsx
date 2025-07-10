import React from "react";
import Slider from "react-slick";
import LeggingsBanner from "./LeggingsBanner";
import ChuridarBanner from "./ChuridarBanner";
import BlouseBanner from "./BlouseBanner";

const CustomArrow = ({ direction, onClick }) => (
  <div
    onClick={onClick}
    style={{
      position: "absolute",
      top: "50%",
      [direction === "left" ? "left" : "right"]: 0,
      transform: "translateY(-50%)",
      zIndex: 2,
      background: "transparent",
      width: 60,
      height: 120,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
      ":hover": {
        backgroundColor: "rgba(0, 0, 0, 0.3)"
      }
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.3)"}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
  >
    <span style={{
      fontSize: 24,
      color: "white",
      fontWeight: 300,
      lineHeight: 1,
      opacity: 0.8
    }}>
      {direction === "left" ? "←" : "→"}
    </span>
  </div>
);

const HeroSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    nextArrow: <CustomArrow direction="right" />,
    prevArrow: <CustomArrow direction="left" />,
    className: "hero-slider"
  };

  return (
    <div style={{
      maxWidth: "1380px",
      margin: "2rem auto",
      borderRadius: "24px",
      overflow: "hidden"
    }}>
      <Slider {...settings}>
        <div>
        <LeggingsBanner />
        </div>
        <div>
        <ChuridarBanner />
        </div>
        <div>
        <BlouseBanner />
        </div>
      </Slider>
    </div>
  );
};

export default HeroSlider; 