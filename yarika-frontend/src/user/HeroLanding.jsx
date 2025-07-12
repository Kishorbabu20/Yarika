import React, { useState, useEffect, Suspense, lazy } from "react";
import { ArrowRight, Mail, Phone, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../config/axios";
// import NavigationBarSection from "./NavigationBarSection";
import "../styles/global.css";
import YarikaLogo from "../assets/YarikaLogo1.png";
import YarikaLogo3 from "../assets/YarikaLogo3.png";
import YarikaLogo2 from "../assets/YarikaLogo2.png";
import YarikaMarquee from "../user/YarikaMarquee.jsx";
import WhatsappIcon from "../assets/whatsapp-gold.png";
import MailIcon from "../assets/mail-gold.png";
import PhoneIcon from "../assets/phone-gold.png";
import IndianFlag from "../assets/flag-for-india.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HeroSlider from "./HeroSlider";
import LeggingsBanner from "./LeggingsBanner";
import ChuridarBanner from "./ChuridarBanner";
import BlouseBanner from "./BlouseBanner";
import LoginModal from "./LoginModal";
import SignatureCollection from "./SignatureCollection";

const ProductCard = lazy(() => import("./ProductCard"));

const HeroLanding = () => {
  const [products, setProducts] = useState([]);
  const [activeBlouse, setActiveBlouse] = useState("aari-blouse");
  const [activeLegging, setActiveLegging] = useState("ankle-length-leggings");
  const [activeMaterial, setActiveMaterial] = useState("aari-cloth");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  const isLoggedIn = () => !!localStorage.getItem("token");

  useEffect(() => {
    if (!isLoggedIn()) {
    const timer = setTimeout(() => {
      setShowLogin(true);
    }, 5000); // Show modal after 5 seconds

    return () => clearTimeout(timer);
    }
  }, []);

  const closeLogin = () => setShowLogin(false);
  const switchToSignup = () => {
    setShowLogin(false);
    // You can trigger signup modal here if needed
  };

  const formatSlug = (str) =>
    str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const filterByCategory = (category) =>
    products.filter((p) => p.category?.toLowerCase().includes(category));

  const trendingProducts = products.filter(
    (p) =>
      p.group?.toLowerCase().includes("best-seller") ||
      p.group?.toLowerCase().includes("signature")
  );

  const blouseProducts = filterByCategory(activeBlouse);
  const leggingProducts = filterByCategory(activeLegging);
  const materialProducts = filterByCategory(activeMaterial);

  const blouseTypes = [
    "aari-blouse",
    "designer-blouse",
    "embroidery-blouse",
    "ikat-blouse",
    "kalamkari-blouse",
    "plain-blouse",
    "zardozi-blouse",
  ];
  const leggingsTypes = [
    "ankle-length-leggings",
    "churidar-leggings",
    "shimmer-leggings",
  ];
  const materialTypes = [
    "aari-cloth",
    "embroidery-cloth",
    "zardosi-cloth",
    "aari-embroidery-cloth",
  ];

  return (
    <div className="hero-landing-container">
      {/* <NavigationBarSection /> */}
      <HeroSlider />

      <div className="golden-banner">
        <h4>HOMEGROWN <img src={IndianFlag} alt="Indian Flag" className="indian-flag" /> INDIAN BRAND</h4>
      </div>

      <SignatureCollection />

      <div className="stats-bar">
        <div className="stat-box">
          <h3>100+</h3>
          <p>HAPPY<br />CUSTOMERS</p>
        </div>
        <div className="stat-box">
          <h3>150+</h3>
          <p>COLOR /<br />STYLES</p>
        </div>
        <div className="stat-box">
          <h3>1000+</h3>
          <p>COLLECTIONS</p>
        </div>
      </div>

      {/* Blouses */}
      <section className="category-section">
        <h2 className="section-title">Readymade Blouse</h2>
        <div className="filter-list">
          {blouseTypes.map((type, idx) => (
            <span key={type} style={{ display: 'inline' }}>
              <span
                className={activeBlouse === type ? "active" : ""}
                onClick={() => setActiveBlouse(type)}
                style={{ cursor: 'pointer' }}
              >
                {formatSlug(type)}
              </span>
              {idx < blouseTypes.length - 1 && (
                <span style={{ color: '#c6aa62', margin: '0 0.5em' }}>/</span>
              )}
            </span>
          ))}
        </div>
        <div className="product-grid">
          <Suspense fallback={<div>Loading...</div>}>
            {blouseProducts.map((p) => (
              <ProductCard product={p} key={p._id} />
            ))}
          </Suspense>
        </div>
      </section>

      {/* Leggings */}
      <section className="category-section">
        <h2 className="section-title">Leggings</h2>
        <div className="filter-list">
          {leggingsTypes.map((type, idx) => (
            <span key={type} style={{ display: 'inline' }}>
              <span
                className={activeLegging === type ? "active" : ""}
                onClick={() => setActiveLegging(type)}
                style={{ cursor: 'pointer' }}
              >
                {formatSlug(type)}
              </span>
              {idx < leggingsTypes.length - 1 && (
                <span style={{ color: '#c6aa62', margin: '0 0.5em' }}>/</span>
              )}
            </span>
          ))}
        </div>
        <div className="product-grid">
          <Suspense fallback={<div>Loading...</div>}>
            {leggingProducts.map((p) => (
              <ProductCard product={p} key={p._id} />
            ))}
          </Suspense>
        </div>
      </section>

      {/* Materials */}
      <section className="category-section">
        <h2 className="section-title">Materials</h2>
        <div className="filter-list">
          {materialTypes.map((type, idx) => (
            <span key={type} style={{ display: 'inline' }}>
              <span
                className={activeMaterial === type ? "active" : ""}
                onClick={() => setActiveMaterial(type)}
                style={{ cursor: 'pointer' }}
              >
                {formatSlug(type)}
              </span>
              {idx < materialTypes.length - 1 && (
                <span style={{ color: '#c6aa62', margin: '0 0.5em' }}>/</span>
              )}
            </span>
          ))}
        </div>
        <div className="product-grid">
          <Suspense fallback={<div>Loading...</div>}>
            {materialProducts.map((p) => (
              <ProductCard product={p} key={p._id} />
            ))}
          </Suspense>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div>
          <div className="about-heading">ABOUT US</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
            <img src={YarikaLogo3} alt="Yarika Logo" className="about-logo" />
          </div>
          <div className="about-title">Crafting Timeless Elegance</div>
          <div className="about-paragraph">
          At Yarika, we believe that true elegance is a blend of artistry, authenticity, and individuality. Born from a deep appreciation for India's rich textile heritage, our brand is dedicated to creating exquisite readymade and custom blouses that transcend fleeting trends. Each piece is a testament to meticulous craftsmanship, brought to life by skilled artisans who pour their passion into every stitch and detail.
          </div>
          <div>
            <button className="about-button">
              About Us <span style={{ fontSize: 20 }}>→</span>
            </button>
          </div>
          <div className="about-marquee-bg">
            <div className="about-marquee-track">
              <YarikaMarquee />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonial-section">
        <div className="testimonial-label">CLIENT TESTIMONIAL</div>
        <h2 className="testimonial-heading">
          Our Customers <span className="gold">Love us.</span>
        </h2>
        <div className="testimonial-cards">
          <div className="testimonial-card">
            <span className="testimonial-quote">“</span>
            <p>I  received excellent service from the team at Yarika. They were attentive, professional, and helped me find the ideal blouse for my occasion.</p>
            <div className="testimonial-author">~ Tina</div>
          </div>
          <div className="testimonial-card">
            <span className="testimonial-quote">“</span>
            <p>Yarika's attention to detail and quality craftsmanship set them apart. I was impressed by the intricate embroidery and design of my blouse.</p>
            <div className="testimonial-author">~ Leena</div>
          </div>
        </div>
      </section>

      {/* ✨ Login Modal */}
      {showLogin && !isLoggedIn() && (
        <LoginModal onClose={closeLogin} onSwitchToSignup={switchToSignup} />
      )}
    </div>
  );
};

export default HeroLanding;
