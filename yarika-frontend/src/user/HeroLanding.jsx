import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Helmet } from "react-helmet";
import api from "../config/axios";
import { useScrollFade } from "../hooks/useScrollFade";
import { useAutoCarousel } from "../hooks/useAutoCarousel";
import LoginModal from "./LoginModal";
import SignatureCollection from "./SignatureCollection";
import { generateProductUrl } from "../utils/productUrl";

// Import images
import BlouseBanner from "../assets/Blousebanner.png";
import BlouseBannerMobile from "../assets/Blousebannermobile.png";
import BridalBanner from "../assets/Bridalbanner.png";
import BridalBannerMobile from "../assets/Bridalbannermobile.png";
import LeggingsBanner from "../assets/Leggingsbanner.jpg";
import LeggingsBannerMobile from "../assets/Leggingsbannermobile.png";
import Lehenga from "../assets/Lehenga.png";
import Leggings from "../assets/Leggings.png";
import Blouse from "../assets/Blouse.png";
import gown from "../assets/gown.png";
import Material from "../assets/Material.png";
import YarikaLogo from "../assets/YarikaLogo1.png";
import weddingseason from "../assets/weddingseason.png";
import festivalcelebration from "../assets/festivalcelebration.png";
import everydayethnic from "../assets/everydayethnic.png";
import workwear from "../assets/workwear.png";
import partyevent from "../assets/partyevent.png";
import lehengasection from "../assets/lehengasection.png";
import gownsection from "../assets/gownsection.png";

const ProductCard = lazy(() => import("./ProductCard"));

const HeroLanding = () => {
  const [products, setProducts] = useState([]);
  const [activeBlouse, setActiveBlouse] = useState("aari-blouse");
  const [activeLegging, setActiveLegging] = useState("ankle-length-leggings");
  const [activeMaterial, setActiveMaterial] = useState("aari-cloth");
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Banner navigation state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const desktopSliderRef = useRef(null);
  const mobileSliderRef = useRef(null);

  // Additional images cycling state
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageCycleIntervalRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
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

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (imageCycleIntervalRef.current) {
        clearInterval(imageCycleIntervalRef.current);
      }
    };
  }, []);

  const closeLogin = () => setShowLogin(false);
  const switchToSignup = () => {
    setShowLogin(false);
    // You can trigger signup modal here if needed
  };

  // Banner navigation functions
  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const handlePausePlay = () => {
    const isMobile = window.innerWidth <= 768;
    const slider = isMobile ? mobileSliderRef.current : desktopSliderRef.current;
    
    if (isPaused) {
      slider?.slickPlay();
      setIsPaused(false);
    } else {
      slider?.slickPause();
      setIsPaused(true);
    }
  };

  const handlePrevSlide = () => {
    const isMobile = window.innerWidth <= 768;
    const slider = isMobile ? mobileSliderRef.current : desktopSliderRef.current;
    slider?.slickPrev();
  };

  const handleNextSlide = () => {
    const isMobile = window.innerWidth <= 768;
    const slider = isMobile ? mobileSliderRef.current : desktopSliderRef.current;
    slider?.slickNext();
  };

  const goToSlide = (index) => {
    const isMobile = window.innerWidth <= 768;
    const slider = isMobile ? mobileSliderRef.current : desktopSliderRef.current;
    slider?.slickGoTo(index);
  };

  // Handle product hover for additional images cycling
  const handleProductHover = (productId, additionalImages) => {
    if (!additionalImages || additionalImages.length === 0) return;
    
    setHoveredProduct(productId);
    setCurrentImageIndex(0);
    
    // Start cycling through images every 3 seconds
    imageCycleIntervalRef.current = setInterval(() => {
      setCurrentImageIndex(prevIndex => 
        (prevIndex + 1) % additionalImages.length
      );
    }, 3000);
  };

  const handleProductLeave = () => {
    setHoveredProduct(null);
    setCurrentImageIndex(0);
    
    // Clear the interval when leaving
    if (imageCycleIntervalRef.current) {
      clearInterval(imageCycleIntervalRef.current);
      imageCycleIntervalRef.current = null;
    }
  };

  // Handle product click and redirect to SelectProductPage
  const handleProductClick = (product) => {
    // Use the same URL generation logic as ProductCard component
    const url = generateProductUrl(product, 'home');
    
    navigate(url, { 
      state: { 
        productId: product._id,
        product: product,
        productSlug: product.seoUrl,
        categoryType: product.categoryType,
        category: product.category
      } 
    });
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
  const bridalProductsAll = Array.isArray(products)
    ? products.filter(
        (p) =>
          p.categoryType === 'bridal' ||
          p.category?.toLowerCase().includes('lehenga') ||
          p.category?.toLowerCase().includes('gown')
      )
    : [];

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
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: !isPaused,
    autoplaySpeed: 4000,
    arrows: false,
    className: "main-slider",
    beforeChange: (oldIndex, newIndex) => handleSlideChange(newIndex),
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          autoplay: !isPaused,
        }
      }
    ]
  };

  const mobileSliderSettings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: !isPaused,
    autoplaySpeed: 4000,
    arrows: false,
    className: "main-slider",
    beforeChange: (oldIndex, newIndex) => handleSlideChange(newIndex),
    pauseOnHover: true
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

  // const testimonials = [
  //   {
  //     text: "I received excellent service from the team at Yarika. They were attentive, professional, and helped me find the ideal blouse for my occasion.",
  //     author: "Tina"
  //   },
  //   {
  //     text: "Yarika's attention to detail and quality craftsmanship set them apart. I was impressed by the intricate embroidery and design of my blouse.",
  //     author: "Leena"
  //   },
  //   {
  //     text: "Yarika's online store provided an excellent shopping experience! Their selections are great, and the perfect blouse was easily found for my occasion. The professionalism and attentiveness to detail are impressive.",
  //     author: "Rekha"
  //   },
  //   {
  //     text: "Yarika is my new go-to online store for women and kids' clothing. The quality of the blouse purchased was exceptional, and the attentiveness in helping choose the perfect piece was impressive. The entire experience was professional and truly delightful.",
  //     author: "Harini"
  //   }
  // ];

  const testimonials = [
    {
      text: "The Customer Service At Yarika Is Unmatched! I Had A Question About My Order, And The Team Responded Promptly. My Lehanga Arrived On Time, And It's Gorgeous. The Attention To Detail And Quality Is Superb. Will Definitely Order Again!",
      author: "Shiwani Agarwal",
      location: "Pune"
    },
    {
      text: "The Dress I Ordered From Yarika Was Exactly What I Hoped For! The Colors Were Vibrant, And The Fabric Felt Rich. Everyone At The Party Loved It, And I Felt So Confident Wearing It. Thank You For The Wonderful Product And Experience!",
      author: "Anju Kurian",
      location: "Kerala"
    },
    {
      text: "I received excellent service from the team at Yarika. They were attentive, professional, and helped me find the ideal blouse for my occasion.",
      author: "Tina",
      location: "Mumbai"
    },
    {
      text: "Yarika's attention to detail and quality craftsmanship set them apart. I was impressed by the intricate embroidery and design of my blouse.",
      author: "Leena",
      location: "Delhi"
    }
  ];

  const carouselRef = useAutoCarousel();

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a relative path, construct full URL
    if (imagePath.startsWith('/')) {
      return `${window.location.origin}${imagePath}`;
    }
    
    // If it's just a filename, construct URL with uploads path
    return `${window.location.origin}/uploads/${imagePath}`;
  };

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
              <Slider {...sliderSettings} ref={desktopSliderRef}>
                <div>
                  <Link to="/products">
                    <img src={BlouseBanner} alt="Get Ready with Our Exclusive Blouses" className="main-banner-img" />
                  </Link>
                </div>
                <div>
                  <Link to="/home/bridal/lehengas">
                    <img src={BridalBanner} alt="Step Into Elegance - Bridal Lehengas & Gowns" className="main-banner-img" />
                  </Link>
                </div>
                <div>
                  <Link to="/home/leggings">
                    <img src={LeggingsBanner} alt="Exclusive Leggings Collection" className="main-banner-img" />
                  </Link>
                </div>
              </Slider>
              
              {/* Banner Navigation Controls */}
              <div className="banner-navigation">
                <div className="banner-progress-indicators">
                  <div 
                    className={`progress-line ${currentSlide === 0 ? 'active' : ''}`}
                    onClick={() => goToSlide(0)}
                  ></div>
                  <div 
                    className={`progress-line ${currentSlide === 1 ? 'active' : ''}`}
                    onClick={() => goToSlide(1)}
                  ></div>
                  <div 
                    className={`progress-line ${currentSlide === 2 ? 'active' : ''}`}
                    onClick={() => goToSlide(2)}
                  ></div>
                </div>
                <div className="banner-controls">
                  <button className="banner-control-btn pause-btn" onClick={handlePausePlay}>
                    <span className="pause-icon">{isPaused ? '▶' : '❚❚'}</span>
                  </button>
                  <button className="banner-control-btn prev-btn" onClick={handlePrevSlide}>
                    <span className="arrow-icon">‹</span>
                  </button>
                  <button className="banner-control-btn next-btn" onClick={handleNextSlide}>
                    <span className="arrow-icon">›</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="main-banner-mobile">
              <Slider {...mobileSliderSettings} ref={mobileSliderRef}>
                <div>
                  <Link to="/products">
                    <img src={BlouseBannerMobile} alt="Get Ready with Our Exclusive Blouses" className="main-banner-img" />
                  </Link>
                </div>
                <div>
                  <Link to="/home/bridal/lehengas">
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
         
         {/* Featured */}
          <div id="featured" ref={signatureRef} className={`signature-section scroll-animate ${signatureFade}`} style={{cursor: 'pointer'}} onClick={() => navigate('/products')}>
          <SignatureCollection />
          </div>

          {/* Shop By Category Section */}
          <section className="shop-by-category-section">
            <div className="category-section-header">
              <h2 className="category-section-title">Shop By Category</h2>
              <div className="category-navigation">
                <button className="nav-arrow prev" onClick={() => document.querySelector('.category-cards').scrollBy({left: -300, behavior: 'smooth'})}>
                  ‹
                </button>
                <button className="nav-arrow next" onClick={() => document.querySelector('.category-cards').scrollBy({left: 300, behavior: 'smooth'})}>
                  ›
                </button>
              </div>
            </div>
            <div className="category-cards">
              <div className="category-card" onClick={() => navigate('/home/bridal/lehengas')} style={{cursor:'pointer'}}>
                <img src={Lehenga} alt="Lehanga" className="category-image" />
                <div className="category-label">Lehanga</div>
              </div>
              <div className="category-card" onClick={() => navigate('/home/leggings')} style={{cursor:'pointer'}}>
                <img src={Leggings} alt="Leggings" className="category-image" />
                <div className="category-label">Leggings</div>
              </div>
              <div className="category-card" onClick={() => navigate('/home/readymade-blouse')} style={{cursor:'pointer'}}>
                <img src={Blouse} alt="Readymade Blouse" className="category-image" />
                <div className="category-label">Readymade Blouse</div>
              </div>
              <div className="category-card" onClick={() => navigate('/home/bridal/gowns')} style={{cursor:'pointer'}}>
                <img src={gown} alt="Gown" className="category-image" />
                <div className="category-label">Gown</div>
          </div>
              <div className="category-card" onClick={() => navigate('/home/materials')} style={{cursor:'pointer'}}>
                <img src={Material} alt="Blouse materials" className="category-image" />
                <div className="category-label">Blouse Materials</div>
          </div>
          </div>
          </section>

          {/* New Arrivals Section */}
          <section className="new-arrivals-section">
            <div className="arrivals-section-header">
              <h2 className="arrivals-section-title">New Arrivals</h2>
              <div className="arrivals-navigation">
                <button className="nav-arrow prev" onClick={() => document.querySelector('.new-arrivals-cards').scrollBy({left: -300, behavior: 'smooth'})}>
                  ‹
                </button>
                <button className="nav-arrow next" onClick={() => document.querySelector('.new-arrivals-cards').scrollBy({left: 300, behavior: 'smooth'})}>
                  ›
                </button>
              </div>
            </div>
            <div className="new-arrivals-cards">
              {products.length > 0 ? (
                products.map((product, index) => {
                  // Debug: log product data
                  console.log('Product in New Arrivals:', product);
                  
                  // Use correct field names from Product model
                  const productImage = product.mainImage || product.additionalImages?.[0] || product.images?.[0] || product.image || product.imageUrl || product.photo;
                  const productName = product.name || product.title || product.productName || 'Product Name';
                  const productPrice = product.sellingPrice || product.price || product.cost || '1,259';
                  const originalPrice = product.mrp || product.originalPrice || product.retailPrice;
                  
                  return (
                    <div 
                      key={product._id || index} 
                      className="product-card"
                      onMouseEnter={() => handleProductHover(product._id || index, product.additionalImages || [productImage])}
                      onMouseLeave={handleProductLeave}
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="product-image-container">
                        <img 
                          src={getImageUrl(productImage)} 
                          alt={productName} 
                          className="product-image"
                          onError={(e) => {
                            console.log('Image failed to load for:', productName, 'falling back to default');
                            e.target.src = BlouseBanner;
                          }}
                        />
                        <div className="new-tag">New</div>
                        
                        {/* Additional Images Container for Hover Effect - FIRST PRODUCT CARD */}
                        {(product.additionalImages && product.additionalImages.length > 0) && (
                          <div className="additional-images-container">
                            {product.additionalImages.map((img, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={getImageUrl(img)}
                                alt={`${productName} - Image ${imgIndex + 1}`}
                                className={`additional-image ${imgIndex === currentImageIndex && hoveredProduct === (product._id || index) ? 'active' : ''}`}
                                onError={(e) => {
                                  e.target.src = getImageUrl(productImage);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <h3 className="product-title">{productName}</h3>
                        <div className="product-pricing">
                          {originalPrice && originalPrice !== productPrice && (
                            <span className="original-price">₹{originalPrice}</span>
                          )}
                          <span className="current-price">₹{productPrice}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-products-message">
                  <p>No products available. Loading...</p>
                </div>
              )}
            </div>
            <div className="view-all-container">
              <Link to="/products" className="view-all-btn">VIEW ALL</Link>
            </div>
          </section>

          {/* Shop By Occasion Section */}
          <section className="shop-by-occasion-section">
            <div className="occasion-section-header">
              <div className="occasion-title-container">
                <h2 className="occasion-title-main">SHOP BY</h2>
                <h2 className="occasion-title-sub">Occasion</h2>
              </div>
            </div>
            <div className="occasion-cards">
              <div className="occasion-navigation">
                <button className="nav-arrow prev" onClick={() => {
                  const container = document.querySelector('.occasion-cards');
                  const cards = container.querySelectorAll('.occasion-card');
                  const firstCard = cards[0];
                  
                  // Move first card to the end
                  container.appendChild(firstCard);
                  
                  // Smooth scroll to show the new first card
                  container.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                  });
                }}>
                  ‹
                </button>
                <button className="nav-arrow next" onClick={() => {
                  const container = document.querySelector('.occasion-cards');
                  const cards = container.querySelectorAll('.occasion-card');
                  const lastCard = cards[cards.length - 1];
                  
                  // Move last card to the beginning
                  container.insertBefore(lastCard, cards[0]);
                  
                  // Smooth scroll to show the new first card
                  container.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                  });
                }}>
                  ›
                </button>
              </div>
              <div 
                className="occasion-card"
                onClick={() => navigate('/occasion/wedding-season')}
                style={{ cursor: 'pointer' }}
              >
                <div className="occasion-image-container wedding-season">
                  <img src={weddingseason} alt="Wedding Season" className="occasion-image" />
                </div>
                <div className="occasion-label">Wedding Season</div>
              </div>
              <div 
                className="occasion-card"
                onClick={() => navigate('/occasion/festive-celebrations')}
                style={{ cursor: 'pointer' }}
              >
                <div className="occasion-image-container festive">
                  <img src={festivalcelebration} alt="Festive Celebrations" className="occasion-image" />
                </div>
                <div className="occasion-label">Festive Celebrations</div>
              </div>
              <div 
                className="occasion-card"
                onClick={() => navigate('/occasion/everyday-ethnic')}
                style={{ cursor: 'pointer' }}
              >
                <div className="occasion-image-container everyday">
                  <img src={everydayethnic} alt="Everyday Ethnic" className="occasion-image" />
                </div>
                <div className="occasion-label">Everyday Ethnic</div>
              </div>
              <div 
                className="occasion-card"
                onClick={() => navigate('/occasion/workwear-staples')}
                style={{ cursor: 'pointer' }}
              >
                <div className="occasion-image-container workwear">
                  <img src={workwear} alt="Workwear Staples" className="occasion-image" />
                </div>
                <div className="occasion-label">Workwear Staples</div>
              </div>
              <div 
                className="occasion-card"
                onClick={() => navigate('/occasion/party-evening-out')}
                style={{ cursor: 'pointer' }}
              >
                <div className="occasion-image-container party">
                  <img src={partyevent} alt="Party & Evening Out" className="occasion-image" />
                </div>
                <div className="occasion-label">Party & Evening Out</div>
              </div>
            </div>
          </section>

          

          {/* Blouses */}
          <section ref={blouseRef} className={`category-section scroll-animate ${blouseFade}`}>
            <div className="category-section-header">
              <h2 className="category-section-title">Readymade Blouse</h2>
              <div className="category-navigation">
                <button className="nav-arrow prev" onClick={() => document.querySelector('.blouse-cards').scrollBy({left: -300, behavior: 'smooth'})}>
                  ‹
                </button>
                <button className="nav-arrow next" onClick={() => document.querySelector('.blouse-cards').scrollBy({left: 300, behavior: 'smooth'})}>
                  ›
                </button>
              </div>
            </div>
            <div className="blouse-cards">
              {blouseProducts.length > 0 ? (
                blouseProducts.map((product, index) => {
                  const productImage = product.mainImage || product.additionalImages?.[0] || product.images?.[0] || product.image || product.imageUrl || product.photo;
                  const productName = product.name || product.title || product.productName || 'Cream Printed Blouse';
                  const productPrice = product.sellingPrice || product.price || product.cost || '890';
                  const originalPrice = product.mrp || product.originalPrice || product.retailPrice || '1,249';
                  
                  return (
                    <div 
                      key={product._id || index} 
                      className="product-card"
                      onMouseEnter={() => handleProductHover(product._id || index, product.additionalImages || [productImage])}
                      onMouseLeave={handleProductLeave}
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="product-image-container">
                        <img 
                          src={getImageUrl(productImage)} 
                          alt={productName} 
                          className="product-image"
                          onError={(e) => {
                            console.log('Image failed to load for:', productName, 'falling back to default');
                            e.target.src = BlouseBanner;
                          }}
                        />
                        <div className="new-tag">New</div>
                        
                        {/* Additional Images Container for Hover Effect - READYMADE BLOUSE */}
                        {(product.additionalImages && product.additionalImages.length > 0) && (
                          <div className="additional-images-container">
                            {product.additionalImages.map((img, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={getImageUrl(img)}
                                alt={`${productName} - Image ${imgIndex + 1}`}
                                className={`additional-image ${imgIndex === currentImageIndex && hoveredProduct === (product._id || index) ? 'active' : ''}`}
                                onError={(e) => {
                                  e.target.src = getImageUrl(productImage);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <h3 className="product-title">{productName}</h3>
                        <div className="product-pricing">
                          {originalPrice && originalPrice !== productPrice && (
                            <span className="original-price">₹{originalPrice}</span>
                          )}
                          <span className="current-price">₹{productPrice}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-products-message">
                  <p>No blouse products available.</p>
            </div>
              )}
            </div>
            <div className="view-all-container">
              <Link to="/home/readymade-blouse" className="view-all-btn">VIEW ALL</Link>
            </div>
          </section>

          {/* Leggings */}
          <section ref={leggingsRef} className={`category-section scroll-animate ${leggingsFade}`}>
            <div className="category-section-header">
              <h2 className="category-section-title">Leggings</h2>
              <div className="category-navigation">
                <button className="nav-arrow prev" onClick={() => document.querySelector('.leggings-cards').scrollBy({left: -300, behavior: 'smooth'})}>
                  ‹
                </button>
                <button className="nav-arrow next" onClick={() => document.querySelector('.leggings-cards').scrollBy({left: 300, behavior: 'smooth'})}>
                  ›
                </button>
              </div>
            </div>
            <div className="leggings-cards">
              {leggingProducts.length > 0 ? (
                leggingProducts.map((product, index) => {
                  const productImage = product.mainImage || product.additionalImages?.[0] || product.images?.[0] || product.image || product.imageUrl || product.photo;
                  const productName = product.name || product.title || product.productName || 'Leggings';
                  const productPrice = product.sellingPrice || product.price || product.cost || '299';
                  const originalPrice = product.mrp || product.originalPrice || product.retailPrice || '499';
                  
                  return (
                    <div 
                      key={product._id || index} 
                      className="product-card"
                      onMouseEnter={() => handleProductHover(product._id || index, product.additionalImages || [productImage])}
                      onMouseLeave={handleProductLeave}
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="product-image-container">
                        <img 
                          src={getImageUrl(productImage)} 
                          alt={productName} 
                          className="product-image"
                          onError={(e) => {
                            console.log('Image failed to load for:', productName, 'falling back to default');
                            e.target.src = LeggingsBanner;
                          }}
                        />
                        <div className="new-tag">New</div>
                        
                        {/* Additional Images Container for Hover Effect - LEGGINGS */}
                        {(product.additionalImages && product.additionalImages.length > 0) && (
                          <div className="additional-images-container">
                            {product.additionalImages.map((img, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={getImageUrl(img)}
                                alt={`${productName} - Image ${imgIndex + 1}`}
                                className={`additional-image ${imgIndex === currentImageIndex && hoveredProduct === (product._id || index) ? 'active' : ''}`}
                                onError={(e) => {
                                  e.target.src = getImageUrl(productImage);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <h3 className="product-title">{productName}</h3>
                        <div className="product-pricing">
                          {originalPrice && originalPrice !== productPrice && (
                            <span className="original-price">₹{originalPrice}</span>
                          )}
                          <span className="current-price">₹{productPrice}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-products-message">
                  <p>No leggings products available.</p>
            </div>
              )}
            </div>
            <div className="view-all-container">
              <Link to="/home/leggings" className="view-all-btn">VIEW ALL</Link>
            </div>
          </section>

          {/* Materials */}
          <section ref={materialRef} className={`category-section scroll-animate ${materialFade}`}>
            <div className="category-section-header">
              <h2 className="category-section-title">Materials</h2>
              <div className="category-navigation">
                <button className="nav-arrow prev" onClick={() => document.querySelector('.materials-cards').scrollBy({left: -300, behavior: 'smooth'})}>
                  ‹
                </button>
                <button className="nav-arrow next" onClick={() => document.querySelector('.materials-cards').scrollBy({left: 300, behavior: 'smooth'})}>
                  ›
                </button>
              </div>
            </div>
            <div className="materials-cards">
              {materialProducts.length > 0 ? (
                materialProducts.map((product, index) => {
                  const productImage = product.mainImage || product.additionalImages?.[0] || product.images?.[0] || product.image || product.imageUrl || product.photo;
                  const productName = product.name || product.title || product.productName || 'Material';
                  const productPrice = product.sellingPrice || product.price || product.cost || '799';
                  const originalPrice = product.mrp || product.originalPrice || product.retailPrice || '1,199';
                  
                  return (
                    <div 
                      key={product._id || index} 
                      className="product-card"
                      onMouseEnter={() => handleProductHover(product._id || index, product.additionalImages || [productImage])}
                      onMouseLeave={handleProductLeave}
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="product-image-container">
                        <img 
                          src={getImageUrl(productImage)} 
                          alt={productName} 
                          className="product-image"
                          onError={(e) => {
                            console.log('Image failed to load for:', productName, 'falling back to default');
                            e.target.src = BlouseBanner;
                          }}
                        />
                        <div className="new-tag">New</div>
                        
                        {/* Additional Images Container for Hover Effect - MATERIALS */}
                        {(product.additionalImages && product.additionalImages.length > 0) && (
                          <div className="additional-images-container">
                            {product.additionalImages.map((img, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={getImageUrl(img)}
                                alt={`${productName} - Image ${imgIndex + 1}`}
                                className={`additional-image ${imgIndex === currentImageIndex && hoveredProduct === (product._id || index) ? 'active' : ''}`}
                                onError={(e) => {
                                  e.target.src = getImageUrl(productImage);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <h3 className="product-title">{productName}</h3>
                        <div className="product-pricing">
                          {originalPrice && originalPrice !== productPrice && (
                            <span className="original-price">₹{originalPrice}</span>
                          )}
                          <span className="current-price">₹{productPrice}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-products-message">
                  <p>No materials available.</p>
                </div>
              )}
            </div>
            <div className="view-all-container">
              <Link to="/home/materials" className="view-all-btn">VIEW ALL</Link>
            </div>
          </section>


          {/* Bridal Collections Section - large cards */}
          <section className="bridal-collections-section">
            <div className="bridal-header">
              <h2 className="bridal-brand">YARIKA'S</h2>
              <h3 className="bridal-title">Bridal Collections</h3>
            </div>
            <div className="bridal-cards">
              <div className="bridal-card" style={{cursor: 'pointer'}} onClick={() => navigate('/home/bridal/lehengas')}>
                <img 
                  src={lehengasection} 
                  alt="Bridal Lehanga" 
                  className="bridal-image"
                />
                <div className="bridal-overlay">
                  <div className="bridal-subtitle">Your Style & Comfort</div>
                  <div className="bridal-category">Lehanga</div>
                  <div className="bridal-shop-btn">Shop Now</div>
                </div>
              </div>
              <div className="bridal-card" style={{cursor: 'pointer'}} onClick={() => navigate('/home/bridal/gowns')}>
                <img 
                  src={gownsection} 
                  alt="Bridal Gowns" 
                  className="bridal-image"
                />
                <div className="bridal-overlay">
                  <div className="bridal-subtitle">Your Style & Comfort</div>
                  <div className="bridal-category">Gowns</div>
                  <div className="bridal-shop-btn">Shop Now</div>
                </div>
              </div>
            </div>
          </section>

           {/* Exclusive Bridal Lehanga's Section */}
           <section className="category-section exclusive-lehengas-section">
            <div className="category-section-header">
              <h2 className="category-section-title">Exclusive Bridal Lehanga's</h2>
              <div className="category-navigation">
                <button className="nav-arrow prev" onClick={() => document.querySelector('.lehengas-cards').scrollBy({left: -300, behavior: 'smooth'})}>
                  ‹
                </button>
                <button className="nav-arrow next" onClick={() => document.querySelector('.lehengas-cards').scrollBy({left: 300, behavior: 'smooth'})}>
                  ›
                </button>
              </div>
            </div>
            <div className="lehengas-cards">
              {products.filter(p => p.categoryType === 'bridal' && p.category?.includes('lehenga')).length > 0 ? (
                products.filter(p => p.categoryType === 'bridal' && p.category?.includes('lehenga')).map((product, index) => {
                  const productImage = product.mainImage || product.additionalImages?.[0] || product.images?.[0] || product.image || product.imageUrl || product.photo;
                  const productName = product.name || product.title || product.productName || 'Light Beige Tissue Designer Lehenga With Sequins Embroidery';
                  const productPrice = product.sellingPrice || product.price || product.cost || '12,549';
                  const originalPrice = product.mrp || product.originalPrice || product.retailPrice || '16,249';
                  
                  return (
                    <div 
                      key={product._id || index} 
                      className="product-card"
                      onMouseEnter={() => handleProductHover(product._id || index, product.additionalImages || [productImage])}
                      onMouseLeave={handleProductLeave}
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="product-image-container">
                        <img 
                          src={getImageUrl(productImage)} 
                          alt={productName} 
                          className="product-image"
                          onError={(e) => {
                            console.log('Image failed to load for:', productName, 'falling back to default');
                            e.target.src = BridalBanner;
                          }}
                        />
                                                <div className="new-tag">New</div>
                        
                        {/* Additional Images Container for Hover Effect - EXCLUSIVE BRIDAL LEHANGAS */}
                        {(product.additionalImages && product.additionalImages.length > 0) && (
                          <div className="additional-images-container">
                            {product.additionalImages.map((img, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={getImageUrl(img)}
                                alt={`${productName} - Image ${imgIndex + 1}`}
                                className={`additional-image ${imgIndex === currentImageIndex && hoveredProduct === (product._id || index) ? 'active' : ''}`}
                                onError={(e) => {
                                  e.target.src = getImageUrl(productImage);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <h3 className="product-title">{productName}</h3>
                        <div className="product-pricing">
                          {originalPrice && originalPrice !== productPrice && (
                            <span className="original-price">₹{originalPrice}</span>
                          )}
                          <span className="current-price">₹{productPrice}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-products-message">
                  <p>No bridal lehengas available.</p>
                </div>
              )}
            </div>
            <div className="view-all-container">
              <Link to="/home/bridal/lehengas" className="view-all-btn">VIEW ALL</Link>
            </div>
          </section>

           {/* Premium Wedding Gowns Section */}
           <section className="category-section premium-gowns-section">
            <div className="category-section-header">
              <h2 className="category-section-title">Premium Wedding Gowns</h2>
              <div className="category-navigation">
                <button className="nav-arrow prev" onClick={() => document.querySelector('.gowns-cards').scrollBy({left: -300, behavior: 'smooth'})}>
                  ‹
                </button>
                <button className="nav-arrow next" onClick={() => document.querySelector('.gowns-cards').scrollBy({left: 300, behavior: 'smooth'})}>
                  ›
                </button>
              </div>
            </div>
            <div className="gowns-cards">
              {products.filter(p => p.categoryType === 'bridal' && p.category?.includes('gown')).length > 0 ? (
                products.filter(p => p.categoryType === 'bridal' && p.category?.includes('gown')).map((product, index) => {
                  const productImage = product.mainImage || product.additionalImages?.[0] || product.images?.[0] || product.image || product.imageUrl || product.photo;
                  const productName = product.name || product.title || product.productName || 'Premium Wedding Gown';
                  const productPrice = product.sellingPrice || product.price || product.cost || '16,879';
                  const originalPrice = product.mrp || product.originalPrice || product.retailPrice || '19,999';
                  
                  return (
                    <div 
                      key={product._id || index} 
                      className="product-card"
                      onMouseEnter={() => handleProductHover(product._id || index, product.additionalImages || [productImage])}
                      onMouseLeave={handleProductLeave}
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="product-image-container">
                        <img 
                          src={getImageUrl(productImage)} 
                          alt={productName} 
                          className="product-image"
                          onError={(e) => {
                            console.log('Image failed to load for:', productName, 'falling back to default');
                            e.target.src = BridalBanner;
                          }}
                        />
                        <div className="new-tag">New</div>
                        
                        {/* Additional Images Container for Hover Effect - PREMIUM WEDDING GOWNS */}
                        {(product.additionalImages && product.additionalImages.length > 0) && (
                          <div className="additional-images-container">
                            {product.additionalImages.map((img, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={getImageUrl(img)}
                                alt={`${productName} - Image ${imgIndex + 1}`}
                                className={`additional-image ${imgIndex === currentImageIndex && hoveredProduct === (product._id || index) ? 'active' : ''}`}
                                onError={(e) => {
                                  e.target.src = getImageUrl(productImage);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <h3 className="product-title">{productName}</h3>
                        <div className="product-pricing">
                          {originalPrice && originalPrice !== productPrice && (
                            <span className="original-price">₹{originalPrice}</span>
                          )}
                          <span className="current-price">₹{productPrice}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-products-message">
                  <p>No wedding gowns available.</p>
                </div>
              )}
            </div>
            <div className="view-all-container">
              <Link to="/home/bridal/gowns" className="view-all-btn">VIEW ALL</Link>
            </div>
          </section>

          {/* Client Diaries Section */}
          <section className="client-diaries-section">
            <div className="diaries-header">
              <h2 className="diaries-title">Client Diaries</h2>
              <div className="diaries-navigation">
                <button className="diary-nav-arrow prev" onClick={() => document.querySelector('.testimonials-container').scrollBy({left: -400, behavior: 'smooth'})}>
                  ‹
                </button>
                <button className="diary-nav-arrow next" onClick={() => document.querySelector('.testimonials-container').scrollBy({left: 400, behavior: 'smooth'})}>
                  ›
                </button>
              </div>
            </div>
            <div className="testimonials-container">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div className="quote-icon">99</div>
                  <p className="testimonial-text">
                    {testimonial.text}
                  </p>
                  <div className="customer-info">
                    <div className="customer-name">{testimonial.author}</div>
                    <div className="customer-location">{testimonial.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

         

          {/* About Section */}
          {/* <section ref={aboutRef} className={`about-section hide-on-mobile scroll-animate ${aboutFade}`}>
            <div>
              <div className="about-heading">ABOUT US</div>
              <div className="about-logo-wrapper">
                <img src={YarikaLogo3} alt="Yarika Logo" className="about-logo" />
              </div>
              <div className="about-title">Crafting Timeless Elegance</div>
              <div className="about-paragraph">
              At Yarika, we believe that true elegance is a blend of artistry, authenticity, and individuality. Born from a deep appreciation for India's rich textile heritage, our brand is dedicated to creating exquisite readymade and custom blouses that transcend fleeting trends. Each piece is a testament to meticulous craftsmanship, brought to life by skilled artisans who pour their passion into every stitch and detail.
              </div>
              {/* <div className="about-marquee-bg">
                <div className="about-marquee-track">
                  <YarikaMarquee />
                </div>
              </div> 
            </div>
          </section> */}

          {/* Testimonials */}
          {/* <section ref={testimonialsRef} className={`testimonial-section scroll-animate ${testimonialsFade}`}>
            <div className="testimonial-label">CLIENT TESTIMONIAL</div>
            <h2 className="testimonial-heading">
              Our Customers <span className="gold">Love us.</span>
            </h2>
             {/* <div className="testimonial-marquee">
              <div className="testimonial-cards marquee-animate" ref={carouselRef}>
                {[...testimonials, ...testimonials].map((testimonial, idx) => (
                  <div className="testimonial-card" key={idx}>
                <span className="testimonial-quote">“</span>
                    <p>{testimonial.text}</p>
                    <div className="testimonial-author">~ {testimonial.author}</div>
              </div>
                ))}
              </div>
            </div>
          </section> */}

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
