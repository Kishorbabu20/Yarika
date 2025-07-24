import React, { useState, useEffect, Suspense, lazy } from "react";
import { ArrowRight, Mail, Phone, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
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
import LoginModal from "./LoginModal";
import SignatureCollection from "./SignatureCollection";
import BlouseBannerMobile from "../assets/Blousebannermobile.png";
import BlouseBanner from "../assets/Blousebanner.png";
import BridalBanner from "../assets/Bridalbanner.png";
import Slider from "react-slick";
import BridalBannerMobile from "../assets/Bridalbannermobile.png";
import { useRef } from "react";
import BridalCollections from "./BridalCollections";
import { useScrollFade } from "../hooks/useScrollFade";
import LeggingsBanner from "../assets/Leggingsbanner.png";
import LeggingsBannerMobile from "../assets/Leggingsbannermobile.png";

function useScrollAnimation() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

const ProductCard = lazy(() => import("./ProductCard"));

const HeroLanding = () => {
  const [products, setProducts] = useState([]);
  const [activeBlouse, setActiveBlouse] = useState("aari-blouse");
  const [activeLegging, setActiveLegging] = useState("ankle-length-leggings");
  const [activeMaterial, setActiveMaterial] = useState("aari-cloth");
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        // Defensive: ensure array
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]); // fallback to empty array
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    // Simulate loading or wait for products/images
    const timer = setTimeout(() => setLoading(false), 1200); // 1.2s fade-in
    return () => clearTimeout(timer);
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
    Array.isArray(products)
      ? products.filter((p) => p.category?.toLowerCase().includes(category))
      : [];

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

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    className: "main-slider"
  };

  const mobileSliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    className: "main-slider"
  };

  // Animation refs and classes for all major sections
  const [mainBannerRef, mainBannerFade] = useScrollFade();
  const [goldenBannerRef, goldenBannerFade] = useScrollFade();
  const [signatureRef, signatureFade] = useScrollFade();
  const [bridalRef, bridalFade] = useScrollFade();
  const [statsRef, statsFade] = useScrollFade();
  const [blouseRef, blouseFade] = useScrollFade();
  const [leggingsRef, leggingsFade] = useScrollFade();
  const [materialRef, materialFade] = useScrollFade();
  const [aboutRef, aboutFade] = useScrollFade();
  const [testimonialsRef, testimonialsFade] = useScrollFade();

  return (
    <div className="hero-landing-container">
      <Helmet>
        <title>Yarika</title>
        <meta name="description" content="Shop exclusive designer ethnic wear at Yarika. Premium quality blouses, leggings, and materials with perfect fit. Free shipping across India. Homegrown Indian brand." />
        <meta name="keywords" content="ethnic wear, designer blouses, leggings, materials, traditional clothing, Indian brand, Yarika, kalamkari, embroidery, zardozi, ikat" />
        <meta property="og:title" content="Yarika - Premium Ethnic Wear | Designer Blouses, Leggings & Materials" />
        <meta property="og:description" content="Shop exclusive designer ethnic wear at Yarika. Premium quality blouses, leggings, and materials with perfect fit. Free shipping across India. Homegrown Indian brand." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={YarikaLogo} />
      </Helmet>

      {loading ? (
        <div className="page-loader">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="fade-in loaded">
          {/* <NavigationBarSection /> */}
          <div ref={mainBannerRef} className={`main-banner scroll-animate ${mainBannerFade}`}>
            <div className="main-banner-desktop">
              <Slider {...sliderSettings}>
                <div>
                  <Link to="/products">
                    <img src={BlouseBanner} alt="Get Ready with Our Exclusive Blouses" className="main-banner-img" />
                  </Link>
                </div>
                <div>
                  <Link to="/home/bridal">
                    <img src={BridalBanner} alt="Step Into Elegance - Bridal Lehengas & Gowns" className="main-banner-img" />
                  </Link>
                </div>
                <div>
                  <Link to="/home/leggings">
                    <img src={LeggingsBanner} alt="Exclusive Leggings Collection" className="main-banner-img" />
                  </Link>
                </div>
              </Slider>
            </div>
            <div className="main-banner-mobile">
              <Slider {...mobileSliderSettings}>
                <div>
                  <Link to="/products">
                    <img src={BlouseBannerMobile} alt="Get Ready with Our Exclusive Blouses" className="main-banner-img" />
                  </Link>
                </div>
                <div>
                  <Link to="/home/bridal">
                    <img src={BridalBannerMobile} alt="Step Into Elegance - Bridal Lehengas & Gowns" className="main-banner-img" />
                  </Link>
                </div>
                <div>
                  <Link to="/home/leggings">
                    <img src={LeggingsBannerMobile} alt="Exclusive Leggings Collection" className="main-banner-img" />
                  </Link>
                </div>
              </Slider>
            </div>
          </div>
         
          <div ref={goldenBannerRef} className={`golden-banner scroll-animate ${goldenBannerFade}`}>
            <h4>HOMEGROWN <img src={IndianFlag} alt="Indian Flag" className="indian-flag" /> INDIAN BRAND</h4>
          </div>

          <div ref={signatureRef} className={`signature-section scroll-animate ${signatureFade}`}>
          <SignatureCollection />
          </div>
          <div ref={bridalRef} className={`bridal-section scroll-animate ${bridalFade}`}>
          <BridalCollections />
          </div>

          <div ref={statsRef} className={`stats-bar scroll-animate ${statsFade}`}>
            <div className="stat-box">
              <h2>100+</h2>
              <p>HAPPY CUSTOMERS</p>
            </div>
            <div className="stat-box">
              <h2>150+</h2>
              <p>COLOR/STYLES</p>
            </div>
            <div className="stat-box">
              <h2>1000+</h2>
              <p>COLLECTIONS</p>
            </div>
          </div>

          {/* Blouses */}
          <section ref={blouseRef} className={`category-section scroll-animate ${blouseFade}`}>
            <div className="blouse-section-header">
              <h2 className="blouse-section-title">Readymade Blouse</h2>
              <Link to="/home/readymade-blouse" className="view-all-btn">View All</Link>
            </div>
            <div className="filter-list">
              {blouseTypes.map((type, idx) => (
                <span key={type} className="filter-item-wrapper">
                  <button
                    className={`filter-btn${activeBlouse === type ? " active" : ""}`}
                    onClick={() => {
                      setActiveBlouse(type);
                      console.log('Selected:', type, 'Current active:', activeBlouse);
                    }}
                    type="button"
                  >
                    {formatSlug(type)}
                  </button>
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
          <section ref={leggingsRef} className={`category-section scroll-animate ${leggingsFade}`}>
            <div className="blouse-section-header">
              <h2 className="section-title">Leggings</h2>
              <Link to="/home/leggings" className="view-all-btn">View All</Link>
            </div>
            <div className="filter-list">
              {leggingsTypes.map((type, idx) => (
                <span key={type} className="filter-item-wrapper">
                  <button
                    className={`filter-btn${activeLegging === type ? " active" : ""}`}
                    onClick={() => {
                      setActiveLegging(type);
                      console.log('Selected:', type, 'Current active:', activeLegging);
                    }}
                    type="button"
                  >
                    {formatSlug(type)}
                  </button>
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
          <section ref={materialRef} className={`category-section scroll-animate ${materialFade}`}>
            <div className="blouse-section-header">
              <h2 className="section-title">Materials</h2>
              <Link to="/home/materials" className="view-all-btn">View All</Link>
            </div>
            <div className="filter-list">
              {materialTypes.map((type, idx) => (
                <span key={type} className="filter-item-wrapper">
                  <button
                    className={`filter-btn${activeMaterial === type ? " active" : ""}`}
                    onClick={() => {
                      setActiveMaterial(type);
                      console.log('Selected:', type, 'Current active:', activeMaterial);
                    }}
                    type="button"
                  >
                    {formatSlug(type)}
                  </button>
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
          <section ref={aboutRef} className={`about-section hide-on-mobile scroll-animate ${aboutFade}`}>
            <div>
              <div className="about-heading">ABOUT US</div>
              <div className="about-logo-wrapper">
                <img src={YarikaLogo3} alt="Yarika Logo" className="about-logo" />
              </div>
              <div className="about-title">Crafting Timeless Elegance</div>
              <div className="about-paragraph">
              At Yarika, we believe that true elegance is a blend of artistry, authenticity, and individuality. Born from a deep appreciation for India's rich textile heritage, our brand is dedicated to creating exquisite readymade and custom blouses that transcend fleeting trends. Each piece is a testament to meticulous craftsmanship, brought to life by skilled artisans who pour their passion into every stitch and detail.
              </div>
              <div className="about-marquee-bg">
                <div className="about-marquee-track">
                  <YarikaMarquee />
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section ref={testimonialsRef} className={`testimonial-section scroll-animate ${testimonialsFade}`}>
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

          {/* Login Modal
          {showLogin && !isLoggedIn() && (
            <LoginModal onClose={closeLogin} onSwitchToSignup={switchToSignup} />
          )} */}
        </div>
      )}
    </div>
  );
};

export default HeroLanding;
